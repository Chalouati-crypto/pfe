import { createOppositionSchema } from "@/app/oppositions/add-opposition";
import type { z } from "zod";

export type Opposition = {
  id: number;
  articleId: number;
  proposedSurfaceCouverte?: number;
  proposedServices?: Array<{ id: string; label?: string }>;
  proposedAutreService?: string;
  status: "opposition_pending" | "opposition_approved" | "opposition_refused";
  reason: string;
  submittedBy: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
};

export type OppositionFormData = z.infer<typeof createOppositionSchema>;
