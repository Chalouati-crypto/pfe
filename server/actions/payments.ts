"use server";

import { actionClient } from "@/lib/safe-actions";
import { createPaymentSchema } from "@/types/payments-schema";
import { revalidatePath } from "next/cache";
import { db } from "..";
import { articles, payments } from "../schema";
import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { z } from "zod";

// Helper function to generate a receipt number
const generateReceiptNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `REC-${timestamp.slice(-6)}-${random}`;
};

export const createPayment = actionClient
  .schema(createPaymentSchema)
  .action(async ({ parsedInput }) => {
    try {
      const session = await auth();
      if (!session) return;
      // Get the article to calculate the tax amount
      const [article] = await db
        .select({
          id: articles.id,
          taxe: articles.taxe,
        })
        .from(articles)
        .where(eq(articles.id, parsedInput.articleId))
        .limit(1);

      if (!article) {
        return {
          success: false,
          error: "Article not found",
        };
      }

      if (!article.taxe) {
        return {
          success: false,
          error: "Tax amount not defined for this article",
        };
      }

      // Generate a single receipt number for all years in this payment
      const receiptNumber = generateReceiptNumber();

      // Create payment records for each year
      const paymentRecords = parsedInput.years.map((year) => ({
        articleId: parsedInput.articleId,
        year,
        amount: Number(article.taxe),
        receiptNumber,
        paymentMethod: parsedInput.paymentMethod,
        notes: parsedInput.notes,
        createdBy: session.user.id,
      }));

      // Insert all payment records
      await db.insert(payments).values(paymentRecords);

      // Revalidate the article page to show updated payment status
      revalidatePath(`/articles/${parsedInput.articleId}`);

      return {
        success: true,
        receiptNumber,
        totalAmount: Number(article.taxe) * parsedInput.years.length,
        yearsPaid: parsedInput.years,
      };
    } catch (error) {
      console.error("Failed to create payment:", error);
      return {
        success: false,
        error: "Failed to process payment. Please try again.",
      };
    }
  });

// Schema for getting payment status by article ID
const getPaymentStatusSchema = z.object({
  articleId: z.number().int().positive(),
});

export const getPaymentStatus = actionClient
  .schema(getPaymentStatusSchema)
  .action(async ({ parsedInput }) => {
    try {
      // Get the current user
      const session = await auth();

      if (!session?.user?.id) {
        return {
          success: false,
          error: "You must be logged in to view payment status",
        };
      }

      // Get the article
      const [article] = await db
        .select({
          id: articles.id,
          dateDebutImposition: articles.dateDebutImposition,
          taxe: articles.taxe,
        })
        .from(articles)
        .where(eq(articles.id, parsedInput.articleId))
        .limit(1);

      if (!article) {
        return {
          success: false,
          error: "Article not found",
        };
      }

      if (!article.taxe) {
        return {
          success: false,
          error: "Tax amount not defined for this article",
        };
      }

      // Get all payments for this article
      const existingPayments = await db
        .select({
          id: payments.id,
          year: payments.year,
          amount: payments.amount,
          paymentDate: payments.paymentDate,
        })
        .from(payments)
        .where(eq(payments.articleId, parsedInput.articleId));

      // Parse the dateDebutImposition (format: "YYYY-MM-DD" or "DD/MM/YYYY")
      let startYear: number;
      if (article.dateDebutImposition.includes("-")) {
        startYear = new Date(article.dateDebutImposition).getFullYear();
      } else {
        // Assuming DD/MM/YYYY format
        const parts = article.dateDebutImposition.split("/");
        startYear = Number.parseInt(parts[2], 10);
      }

      // Get current year
      const currentYear = new Date().getFullYear();

      // Create an array of all years from start to current
      const allYears: YearPaymentStatus[] = [];
      for (let year = startYear; year <= currentYear; year++) {
        const payment = existingPayments.find((p) => p.year === year);
        allYears.push({
          year,
          isPaid: !!payment,
          amount: Number(article.taxe),
          paymentId: payment?.id,
          paymentDate: payment?.paymentDate,
        });
      }

      return {
        success: true,
        yearlyPaymentStatus: allYears,
        taxAmount: Number(article.taxe),
        totalDue:
          allYears.filter((y) => !y.isPaid).length * Number(article.taxe),
        totalPaid:
          allYears.filter((y) => y.isPaid).length * Number(article.taxe),
      };
    } catch (error) {
      console.error("Failed to get payment status:", error);
      return {
        success: false,
        error: "Failed to get payment status. Please try again.",
      };
    }
  });
