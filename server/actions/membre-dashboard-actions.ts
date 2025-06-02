"use server";

import { db } from "..";
import { oppositions, articles, users } from "../schema";
import { eq, count, sql, and, gte, isNotNull } from "drizzle-orm";

export async function getConseilDashboardData() {
  try {
    // Get total oppositions count
    const totalOppositionsResult = await db
      .select({ count: count() })
      .from(oppositions);

    // Get oppositions by status
    const oppositionsByStatus = await db
      .select({
        status: oppositions.status,
        count: count(),
      })
      .from(oppositions)
      .groupBy(oppositions.status);

    // Get oppositions created this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const oppositionsThisMonthResult = await db
      .select({
        status: oppositions.status,
        count: count(),
      })
      .from(oppositions)
      .where(gte(oppositions.createdAt, firstDayOfMonth))
      .groupBy(oppositions.status);

    // Calculate average resolution time (simplified)
    const resolvedOppositionsResult = await db
      .select({
        count: count(),
      })
      .from(oppositions)
      .where(isNotNull(oppositions.resolvedAt));

    // Get urgent oppositions (pending > 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const urgentOppositionsResult = await db
      .select({ count: count() })
      .from(oppositions)
      .where(
        and(
          eq(oppositions.status, "opposition_pending"),
          sql`${oppositions.createdAt} <= ${sevenDaysAgo.toISOString()}`
        )
      );

    const statusData = {
      pending:
        oppositionsByStatus.find((item) => item.status === "opposition_pending")
          ?.count || 0,
      approved:
        oppositionsByStatus.find(
          (item) => item.status === "opposition_approved"
        )?.count || 0,
      refused:
        oppositionsByStatus.find((item) => item.status === "opposition_refused")
          ?.count || 0,
    };

    const thisMonthData = {
      approved:
        oppositionsThisMonthResult.find(
          (item) => item.status === "opposition_approved"
        )?.count || 0,
      refused:
        oppositionsThisMonthResult.find(
          (item) => item.status === "opposition_refused"
        )?.count || 0,
    };

    return {
      oppositions: {
        total: totalOppositionsResult[0]?.count || 0,
        pending: statusData.pending,
        approved: statusData.approved,
        refused: statusData.refused,
        approvedThisMonth: thisMonthData.approved,
        refusedThisMonth: thisMonthData.refused,
        avgResolutionTime: 12, // Default value, can be calculated more precisely later
        urgent: urgentOppositionsResult[0]?.count || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching conseil dashboard data:", error);

    // Return fallback data
    return {
      oppositions: {
        total: 0,
        pending: 0,
        approved: 0,
        refused: 0,
        approvedThisMonth: 0,
        refusedThisMonth: 0,
        avgResolutionTime: 0,
        urgent: 0,
      },
    };
  }
}

export async function getPendingOppositions(limit = 10) {
  try {
    const pending = await db
      .select({
        id: oppositions.id,
        articleId: oppositions.articleId,
        reason: oppositions.reason,
        createdAt: oppositions.createdAt,
        submittedBy: oppositions.submittedBy,
        proposedSurfaceCouverte: oppositions.proposedSurfaceCouverte,
        proposedServices: oppositions.proposedServices,
        proposedAutreService: oppositions.proposedAutreService,
        // Article details
        articleOwner: sql`CONCAT(${articles.nom}, ' ', ${articles.prenom})`,
        articleAddress: sql`CONCAT(${articles.arrondissement}, ', ', ${articles.zone}, ', ', ${articles.rue})`,
        currentSurfaceCouverte: articles.surfaceCouverte,
        currentServices: articles.services,
        currentAutreService: articles.autreService,
        // Submitter details
        submitterName: users.name,
        submitterEmail: users.email,
      })
      .from(oppositions)
      .innerJoin(articles, eq(oppositions.articleId, articles.id))
      .innerJoin(users, eq(oppositions.submittedBy, users.id))
      .where(eq(oppositions.status, "opposition_pending"))
      .orderBy(oppositions.createdAt)
      .limit(limit);

    return pending.map((opposition) => ({
      ...opposition,
      daysOld: Math.floor(
        (Date.now() - new Date(opposition.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      proposedSurfaceCouverte:
        Number(opposition.proposedSurfaceCouverte) || null,
      currentSurfaceCouverte: Number(opposition.currentSurfaceCouverte) || null,
    }));
  } catch (error) {
    console.error("Error fetching pending oppositions:", error);
    return [];
  }
}

export async function approveOpposition(
  oppositionId: number,
  reviewNotes?: string,
  reviewerId?: string
) {
  try {
    const result = await db
      .update(oppositions)
      .set({
        status: "opposition_approved",
        resolvedAt: new Date(),
        reviewedBy: reviewerId,
        reviewNotes: reviewNotes,
        updatedAt: new Date(),
      })
      .where(eq(oppositions.id, oppositionId))
      .returning();

    if (result.length === 0) {
      throw new Error("Opposition not found");
    }

    // Update the article status
    await db
      .update(articles)
      .set({
        status: "opposition_approved",
      })
      .where(eq(articles.id, result[0].articleId));

    return { success: true, opposition: result[0] };
  } catch (error) {
    console.error("Error approving opposition:", error);
    throw new Error("Failed to approve opposition");
  }
}

export async function rejectOpposition(
  oppositionId: number,
  reviewNotes?: string,
  reviewerId?: string
) {
  try {
    const result = await db
      .update(oppositions)
      .set({
        status: "opposition_refused",
        resolvedAt: new Date(),
        reviewedBy: reviewerId,
        reviewNotes: reviewNotes,
        updatedAt: new Date(),
      })
      .where(eq(oppositions.id, oppositionId))
      .returning();

    if (result.length === 0) {
      throw new Error("Opposition not found");
    }

    // Update the article status back to active
    await db
      .update(articles)
      .set({
        status: "active",
      })
      .where(eq(articles.id, result[0].articleId));

    return { success: true, opposition: result[0] };
  } catch (error) {
    console.error("Error rejecting opposition:", error);
    throw new Error("Failed to reject opposition");
  }
}
