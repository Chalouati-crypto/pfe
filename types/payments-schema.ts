import { z } from "zod";

export const paymentMethodEnum = z.enum([
  "cash",
  "check",
  "bank_transfer",
  "credit_card",
  "other",
]);

export const createPaymentSchema = z.object({
  articleId: z.number().int().positive(),
  years: z.array(z.number().int().positive()),
  paymentMethod: paymentMethodEnum,
  notes: z.string().optional(),
});

export type Payment = {
  id: number;
  articleId: number;
  year: number;
  amount: number;
  paymentDate: Date;
  receiptNumber: string;
  paymentMethod: "cash" | "check" | "bank_transfer" | "credit_card" | "other";
  notes?: string;
  createdBy: string;
};

export type YearPaymentStatus = {
  year: number;
  isPaid: boolean;
  amount: number;
  paymentId?: number;
  paymentDate?: Date;
};
