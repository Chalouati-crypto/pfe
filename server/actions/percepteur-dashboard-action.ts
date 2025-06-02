"use server";

import { db } from "..";
import { payments, articles } from "../schema";
import { eq, count, sum, sql, and, gte, desc, isNotNull } from "drizzle-orm";

export async function getPercepteurDashboardData() {
  try {
    // Get total collected amount
    const totalCollectedResult = await db
      .select({
        total: sum(payments.amount),
      })
      .from(payments);

    // Get this month's collections
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const thisMonthResult = await db
      .select({
        total: sum(payments.amount),
        count: count(),
      })
      .from(payments)
      .where(gte(payments.paymentDate, firstDayOfMonth));

    // Get payments by method
    const paymentsByMethod = await db
      .select({
        method: payments.paymentMethod,
        total: sum(payments.amount),
        count: count(),
      })
      .from(payments)
      .groupBy(payments.paymentMethod);

    // Get monthly trend (last 6 months) - simplified
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrendResult = await db
      .select({
        month: sql`EXTRACT(MONTH FROM ${payments.paymentDate})`,
        year: sql`EXTRACT(YEAR FROM ${payments.paymentDate})`,
        amount: sum(payments.amount),
      })
      .from(payments)
      .where(gte(payments.paymentDate, sixMonthsAgo))
      .groupBy(
        sql`EXTRACT(YEAR FROM ${payments.paymentDate}), EXTRACT(MONTH FROM ${payments.paymentDate})`
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM ${payments.paymentDate}), EXTRACT(MONTH FROM ${payments.paymentDate})`
      );

    // Calculate pending payments estimate
    const currentYear = new Date().getFullYear();

    const totalArticlesResult = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.archive, false));

    const paidArticlesResult = await db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.year, currentYear));

    // Get average tax for estimation
    const avgTaxResult = await db
      .select({
        avg: sql`AVG(${articles.taxe})`,
      })
      .from(articles)
      .where(and(eq(articles.archive, false), isNotNull(articles.taxe)));

    const totalArticles = totalArticlesResult[0]?.count || 0;
    const paidArticles = paidArticlesResult[0]?.count || 0;
    const unpaidArticles = Math.max(0, totalArticles - paidArticles);
    const avgTax = Number(avgTaxResult[0]?.avg) || 1000; // Default average tax
    const pendingAmount = unpaidArticles * avgTax;

    // Transform monthly trend data
    const monthNames = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];
    const monthlyTrend = monthlyTrendResult.map((month) => ({
      month: monthNames[Number(month.month) - 1] || "N/A",
      amount: Number(month.amount) || 0,
    }));

    return {
      payments: {
        totalCollected: Number(totalCollectedResult[0]?.total) || 0,
        thisMonth: Number(thisMonthResult[0]?.total) || 0,
        thisMonthCount: thisMonthResult[0]?.count || 0,
        pendingPayments: pendingAmount,
        byMethod: paymentsByMethod.map((method) => ({
          method: method.method || "Unknown",
          amount: Number(method.total) || 0,
          count: method.count || 0,
        })),
        monthlyTrend: monthlyTrend,
        collectionRate:
          totalArticles > 0 ? (paidArticles / totalArticles) * 100 : 0,
      },
    };
  } catch (error) {
    console.error("Error fetching percepteur dashboard data:", error);

    // Return fallback data
    return {
      payments: {
        totalCollected: 0,
        thisMonth: 0,
        thisMonthCount: 0,
        pendingPayments: 0,
        byMethod: [],
        monthlyTrend: [],
        collectionRate: 0,
      },
    };
  }
}

export async function getPaymentsByArrondissement() {
  try {
    const paymentsByArrondissement = await db
      .select({
        arrondissement: articles.arrondissement,
        totalAmount: sum(payments.amount),
        count: count(payments.id),
      })
      .from(payments)
      .innerJoin(articles, eq(payments.articleId, articles.id))
      .where(isNotNull(articles.arrondissement))
      .groupBy(articles.arrondissement)
      .orderBy(desc(sum(payments.amount)));

    return paymentsByArrondissement.map((item) => ({
      arrondissement: item.arrondissement || "Unknown",
      totalAmount: Number(item.totalAmount) || 0,
      count: item.count || 0,
    }));
  } catch (error) {
    console.error("Error fetching payments by arrondissement:", error);
    return [];
  }
}

export async function getRecentPayments(limit = 10) {
  try {
    const recent = await db
      .select({
        id: payments.id,
        articleId: payments.articleId,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        receiptNumber: payments.receiptNumber,
        year: payments.year,
        ownerName: sql`CONCAT(${articles.nom}, ' ', ${articles.prenom})`,
        arrondissement: articles.arrondissement,
      })
      .from(payments)
      .innerJoin(articles, eq(payments.articleId, articles.id))
      .orderBy(desc(payments.paymentDate))
      .limit(limit);

    return recent.map((payment) => ({
      ...payment,
      amount: Number(payment.amount) || 0,
    }));
  } catch (error) {
    console.error("Error fetching recent payments:", error);
    return [];
  }
}
