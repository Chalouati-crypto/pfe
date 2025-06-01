"use server";

import { db } from "..";
import { articles, oppositions } from "../schema";
import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { z } from "zod";
import { Opposition } from "@/types/oppositions-schema";
import { eq } from "lodash";
import { and } from "drizzle-orm";
export async function getOppositions() {
  return db.select().from(oppositions);
}
export async function addOpposition(data: Opposition) {
  const session = await auth();
  if (!session) return;
  try {
    await db.insert(oppositions).values({
      articleId: data.articleId,
      proposedSurfaceCouverte: data.proposedSurfaceCouverte ?? null,
      proposedServices: data.proposedServices ?? null,
      proposedAutreService: data.proposedAutreService ?? null,
      reason: data.reason,
      submittedBy: session.user.id,
      status: "opposition_pending",
    });

    revalidatePath(`/oppositions`);

    return { success: true };
  } catch (err) {
    console.error("Failed to submit opposition:", err);
    return {
      success: false,
      error: "Something went wrong while submitting opposition",
    };
  }
}

const reviewOppositionSchema = z.object({
  oppositionId: z.string(),
  approved: z.boolean(),
  reviewNotes: z.string().optional(),
});

export const reviewOpposition = async (
  oppositionId: number | string,
  decision: "approve" | "reject",
  reviewNotes = ""
) => {
  // Store original ID for debugging
  const originalOppositionId = oppositionId;

  try {
    // CRITICAL: Strict ID validation
    const parsedId = Number(oppositionId);
    if (
      !oppositionId ||
      isNaN(parsedId) ||
      parsedId <= 0 ||
      !Number.isInteger(parsedId)
    ) {
      throw new Error(
        `Invalid opposition ID provided: ${originalOppositionId} (parsed: ${parsedId})`
      );
    }

    // Use the validated ID
    const validatedOppositionId = parsedId;

    console.log(
      `Processing opposition review for ID: ${validatedOppositionId}`
    );

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Authentication required");
    }

    // 1. Retrieve the specific opposition with explicit ID check
    console.log(`Fetching opposition with ID: ${validatedOppositionId}`);
    const [existingOpposition] = await db
      .select()
      .from(oppositions)
      .where(eq(oppositions.id, validatedOppositionId))
      .limit(1);

    if (!existingOpposition) {
      throw new Error(
        `Opposition with ID ${validatedOppositionId} does not exist`
      );
    }

    console.log(
      `Found opposition: ${existingOpposition.id}, status: ${existingOpposition.status}`
    );

    // 2. Check status (MUST be pending)
    if (existingOpposition.status !== "opposition_pending") {
      throw new Error(
        `Opposition ${validatedOppositionId} is not in pending status (current: ${existingOpposition.status})`
      );
    }

    // 3. Verify the opposition ID matches what we expect
    if (existingOpposition.id !== validatedOppositionId) {
      throw new Error(
        `Opposition ID mismatch: expected ${validatedOppositionId}, got ${existingOpposition.id}`
      );
    }

    let articleUpdateSuccess = true;
    let articleUpdateError: string | null = null;

    // 4. Update article if approved
    if (decision === "approve") {
      const updateData: Partial<typeof articles.$inferInsert> = {};

      // Only update fields that have proposed values
      if (
        typeof existingOpposition.proposedSurfaceCouverte === "string" &&
        existingOpposition.proposedSurfaceCouverte !== null
      ) {
        updateData.surfaceCouverte = existingOpposition.proposedSurfaceCouverte;
      }

      if (
        Array.isArray(existingOpposition.proposedServices) &&
        existingOpposition.proposedServices.length > 0
      ) {
        updateData.services = existingOpposition.proposedServices;
      }

      if (
        typeof existingOpposition.proposedAutreService === "string" &&
        existingOpposition.proposedAutreService !== null &&
        existingOpposition.proposedAutreService.trim() !== ""
      ) {
        updateData.autreService = existingOpposition.proposedAutreService;
      }

      // Only proceed with update if there are changes to make
      if (Object.keys(updateData).length > 0) {
        try {
          console.log(
            `Updating article ${existingOpposition.articleId} with:`,
            updateData
          );

          const [updatedArticle] = await db
            .update(articles)
            .set(updateData)
            .where(eq(articles.id, existingOpposition.articleId))
            .returning();

          if (!updatedArticle) {
            throw new Error("Article update returned no results");
          }

          console.log(
            `Article ${existingOpposition.articleId} updated successfully`
          );
        } catch (error) {
          articleUpdateSuccess = false;
          articleUpdateError =
            error instanceof Error
              ? error.message
              : "Unknown error during article update";
          console.error("Article update failed:", error);
        }
      } else {
        console.log(
          "No changes to apply to article - opposition had no proposed values"
        );
      }
    }

    // 5. Determine final status
    let finalStatus: "opposition_approved" | "opposition_rejected";

    if (decision === "approve") {
      if (articleUpdateSuccess) {
        finalStatus = "opposition_approved";
      } else {
        finalStatus = "opposition_rejected";
        reviewNotes =
          `Article update failed: ${articleUpdateError}. ${reviewNotes}`.trim();
      }
    } else {
      finalStatus = "opposition_rejected";
    }

    // 6. CRITICAL: Update ONLY the specific opposition with triple verification
    console.log(
      `Updating opposition ${validatedOppositionId} to status: ${finalStatus}`
    );

    const updateResult = await db
      .update(oppositions)
      .set({
        status: finalStatus,
        reviewedBy: userId,
        reviewNotes: reviewNotes || null,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(oppositions.id, validatedOppositionId))
      .returning();

    if (!updateResult || updateResult.length === 0) {
      throw new Error(`Failed to update opposition ${validatedOppositionId}`);
    }

    if (updateResult.length > 1) {
      throw new Error(
        `CRITICAL ERROR: Multiple oppositions updated! Expected 1, got ${updateResult.length}`
      );
    }

    const [updatedOpposition] = updateResult;

    // Verify the updated opposition is the correct one
    if (updatedOpposition.id !== validatedOppositionId) {
      throw new Error(
        `CRITICAL ERROR: Wrong opposition updated! Expected ${validatedOppositionId}, updated ${updatedOpposition.id}`
      );
    }

    console.log(
      `Successfully updated opposition ${updatedOpposition.id} to ${updatedOpposition.status}`
    );

    // 7. Revalidation
    revalidatePath("/dashboard/oppositions");
    revalidatePath(`/articles/${existingOpposition.articleId}`);
    revalidatePath("/dashboard");

    // 8. Return appropriate response
    if (decision === "approve" && !articleUpdateSuccess) {
      return {
        success: false,
        message: `Opposition could not be approved due to article update failure: ${articleUpdateError}`,
        oppositionId: updatedOpposition.id,
        details: {
          oppositionStatus: finalStatus,
          articleUpdateFailed: true,
          error: articleUpdateError,
        },
      };
    }

    return {
      success: true,
      message: `Opposition ${decision === "approve" ? "approved" : "rejected"} successfully`,
      oppositionId: updatedOpposition.id,
      details: {
        oppositionStatus: finalStatus,
        articleUpdated: decision === "approve" && articleUpdateSuccess,
      },
    };
  } catch (error) {
    console.error(
      `Opposition review failed for ID ${originalOppositionId}:`,
      error
    );

    // CRITICAL: Only attempt revert if we have a valid opposition ID
    const parsedId = Number(originalOppositionId);
    if (!isNaN(parsedId) && parsedId > 0 && Number.isInteger(parsedId)) {
      try {
        console.log(
          `Attempting to revert opposition ${parsedId} to pending status`
        );
        const revertResult = await db
          .update(oppositions)
          .set({
            status: "opposition_pending",
            updatedAt: new Date(),
          })
          .where(eq(oppositions.id, parsedId))
          .returning();

        if (revertResult.length > 1) {
          console.error(
            `CRITICAL ERROR: Multiple oppositions reverted! Expected 1, got ${revertResult.length}`
          );
        }
      } catch (revertError) {
        console.error("Failed to revert opposition status:", revertError);
      }
    } else {
      console.error(
        `Cannot revert - invalid opposition ID: ${originalOppositionId}`
      );
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Database operation failed",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        originalId: originalOppositionId,
      },
    };
  }
};

// Helper function to verify opposition exists and get its current status
export const getOppositionStatus = async (oppositionId: number) => {
  try {
    const parsedId = Number(oppositionId);
    if (!oppositionId || isNaN(parsedId) || parsedId <= 0) {
      throw new Error(`Invalid opposition ID: ${oppositionId}`);
    }

    const [opposition] = await db
      .select({
        id: oppositions.id,
        status: oppositions.status,
        articleId: oppositions.articleId,
      })
      .from(oppositions)
      .where(eq(oppositions.id, parsedId))
      .limit(1);

    return opposition || null;
  } catch (error) {
    console.error("Error fetching opposition status:", error);
    return null;
  }
};
