"use server";

import { createOppositionSchema } from "@/app/oppositions/add-opposition";
import { actionClient } from "@/lib/safe-actions";
import { db } from "..";
import { oppositions } from "../schema";
import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { z } from "zod";
export async function getOppositions() {
  return db.select().from(oppositions);
}
export const addOpposition = actionClient
  .schema(createOppositionSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth();
    if (!session) return;
    try {
      await db.insert(oppositions).values({
        articleId: parsedInput.articleId,
        proposedSurfaceCouverte: parsedInput.proposedSurfaceCouverte,
        proposedServices: parsedInput.proposedServices,
        proposedAutreService: parsedInput.proposedAutreService,
        reason: parsedInput.reason,
        submittedBy: session.user.id,
        status: "opposition_pending",
      });

      // Revalidate the article page to show the new opposition
      revalidatePath(`/oppositions`);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Failed to add opposition:", error);
      return {
        success: false,
        error: "Failed to add opposition. Please try again.",
      };
    }
  });
const reviewOppositionSchema = z.object({
  oppositionId: z.number().int().positive(),
  approved: z.boolean(),
  reviewNotes: z.string().optional(),
});

// export const reviewOpposition = action(
//   reviewOppositionSchema,
//   async (input) => {
//     try {
//       // Get the current user
//       const session = await auth();

//       if (!session?.user?.id) {
//         return {
//           success: false,
//           error: "You must be logged in to review an opposition",
//         };
//       }

//       // Check if user has permission to review oppositions
//       // This is a simplified check - you might want to implement more robust role-based checks
//       if (!["admin", "percepteur"].includes(session.user.role)) {
//         return {
//           success: false,
//           error: "You don't have permission to review oppositions",
//         };
//       }

//       // Get the opposition
//       const [opposition] = await db
//         .select()
//         .from(oppositions)
//         .where(eq(oppositions.id, input.oppositionId))
//         .limit(1);

//       if (!opposition) {
//         return {
//           success: false,
//           error: "Opposition not found",
//         };
//       }

//       // Update the opposition status
//       const newStatus = input.approved
//         ? "opposition_approved"
//         : "opposition_refused";

//       await db
//         .update(oppositions)
//         .set({
//           status: newStatus,
//           reviewedBy: session.user.id,
//           reviewNotes: input.reviewNotes,
//           resolvedAt: new Date(),
//         })
//         .where(eq(oppositions.id, input.oppositionId));

//       // If approved, update the article with the proposed changes
//       if (input.approved) {
//         const updateData: Record<string, any> = {
//           status: "active", // Reset the article status to active
//         };

//         // Only include fields that have proposed changes
//         if (
//           opposition.proposedSurfaceCouverte !== null &&
//           opposition.proposedSurfaceCouverte !== undefined
//         ) {
//           updateData.surfaceCouverte = opposition.proposedSurfaceCouverte;
//         }

//         if (
//           opposition.proposedServices !== null &&
//           opposition.proposedServices !== undefined
//         ) {
//           updateData.services = opposition.proposedServices;
//         }

//         if (
//           opposition.proposedAutreService !== null &&
//           opposition.proposedAutreService !== undefined
//         ) {
//           updateData.autreService = opposition.proposedAutreService;
//         }

//         // Update the article
//         await db
//           .update(articles)
//           .set(updateData)
//           .where(eq(articles.id, opposition.articleId));
//       } else {
//         // If rejected, just update the article status back to active
//         await db
//           .update(articles)
//           .set({
//             status: "active",
//           })
//           .where(eq(articles.id, opposition.articleId));
//       }

//       // Revalidate the article page and oppositions page
//       revalidatePath(`/articles/${opposition.articleId}`);
//       revalidatePath(`/oppositions`);

//       return {
//         success: true,
//         message: input.approved
//           ? "Opposition approved and changes applied"
//           : "Opposition rejected",
//       };
//     } catch (error) {
//       console.error("Failed to review opposition:", error);
//       return {
//         success: false,
//         error: "Failed to review opposition. Please try again.",
//       };
//     }
//   }
// );

export async function reviewOpposition() {
  console.log("hi");
}
