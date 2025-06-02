"use server";

import { db } from "..";
import { articles } from "../schema";
import { eq, count, sql, and, desc } from "drizzle-orm";

export async function getAgentDashboardData() {
  try {
    // Get total articles count
    const totalArticlesResult = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.archive, false));

    // Get articles by property type
    const articlesByType = await db
      .select({
        type: articles.typeDePropriete,
        count: count(),
      })
      .from(articles)
      .where(eq(articles.archive, false))
      .groupBy(articles.typeDePropriete);

    // Get articles by urban density (handle null values)
    const articlesByDensity = await db
      .select({
        density: articles.densiteUrbain,
        count: count(),
      })
      .from(articles)
      .where(
        and(
          eq(articles.archive, false),
          sql`${articles.densiteUrbain} IS NOT NULL`
        )
      )
      .groupBy(articles.densiteUrbain);

    // Get articles by status
    const articlesByStatus = await db
      .select({
        status: articles.status,
        count: count(),
      })
      .from(articles)
      .where(eq(articles.archive, false))
      .groupBy(articles.status);

    // Get recently added articles (last 30 days) - simplified query
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentArticlesResult = await db
      .select({ count: count() })
      .from(articles)
      .where(
        and(
          eq(articles.archive, false),
          sql`${articles.dateDebutImposition}::date >= ${thirtyDaysAgo.toISOString().split("T")[0]}`
        )
      );

    // Get archived articles count
    const archivedArticlesResult = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.archive, true));

    // Transform data for frontend with safe defaults
    const typeData = {
      bati: articlesByType.find((item) => item.type === "bati")?.count || 0,
      nonBati:
        articlesByType.find((item) => item.type === "non bati")?.count || 0,
    };

    const densityData = {
      haute:
        articlesByDensity.find((item) => item.density === "haute")?.count || 0,
      moyenne:
        articlesByDensity.find((item) => item.density === "moyenne")?.count ||
        0,
      basse:
        articlesByDensity.find((item) => item.density === "basse")?.count || 0,
    };

    const statusData = {
      active:
        articlesByStatus.find((item) => item.status === "active")?.count || 0,
      opposition_pending:
        articlesByStatus.find((item) => item.status === "opposition_pending")
          ?.count || 0,
      opposition_approved:
        articlesByStatus.find((item) => item.status === "opposition_approved")
          ?.count || 0,
      opposition_refused:
        articlesByStatus.find((item) => item.status === "opposition_refused")
          ?.count || 0,
    };

    return {
      articles: {
        total: totalArticlesResult[0]?.count || 0,
        bati: typeData.bati,
        nonBati: typeData.nonBati,
        byDensity: densityData,
        byStatus: statusData,
        recentlyAdded: recentArticlesResult[0]?.count || 0,
        archived: archivedArticlesResult[0]?.count || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching agent dashboard data:", error);

    // Return fallback data instead of throwing
    return {
      articles: {
        total: 0,
        bati: 0,
        nonBati: 0,
        byDensity: {
          haute: 0,
          moyenne: 0,
          basse: 0,
        },
        byStatus: {
          active: 0,
          opposition_pending: 0,
          opposition_approved: 0,
          opposition_refused: 0,
        },
        recentlyAdded: 0,
        archived: 0,
      },
    };
  }
}

export async function getArticlesByArrondissement() {
  try {
    const articlesByArrondissement = await db
      .select({
        arrondissement: articles.arrondissement,
        count: count(),
      })
      .from(articles)
      .where(
        and(
          eq(articles.archive, false),
          sql`${articles.arrondissement} IS NOT NULL`
        )
      )
      .groupBy(articles.arrondissement)
      .orderBy(desc(count()));

    return articlesByArrondissement;
  } catch (error) {
    console.error("Error fetching articles by arrondissement:", error);
    return [];
  }
}

export async function getRecentArticles(limit = 10) {
  try {
    const recent = await db
      .select({
        id: articles.id,
        typeDePropriete: articles.typeDePropriete,
        arrondissement: articles.arrondissement,
        zone: articles.zone,
        nom: articles.nom,
        prenom: articles.prenom,
        dateDebutImposition: articles.dateDebutImposition,
        status: articles.status,
      })
      .from(articles)
      .where(eq(articles.archive, false))
      .orderBy(desc(articles.id)) // Use ID instead of date for ordering
      .limit(limit);

    return recent;
  } catch (error) {
    console.error("Error fetching recent articles:", error);
    return [];
  }
}
