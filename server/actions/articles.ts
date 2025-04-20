"use server";
import { db } from "..";
import { articles } from "../schema";
import { articleSchema } from "@/types/articles-schema";
import { eq } from "drizzle-orm";
import { actionClient } from "@/lib/safe-actions";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getArticles() {
  return db.select().from(articles);
}

export const upsertArticle = actionClient
  .schema(articleSchema)
  .action(async ({ parsedInput }) => {
    try {
      const values = parsedInput;
      const { id } = values;
      const updatedArticle = {
        ...values,
        status: "active",
      };
      if (values.typeDePropriete === "bati") {
        // Built land tax calculation
        // Assume:
        // - updatedArticle.surface_couvert: covered surface area for built parts
        // - updatedArticle.prestationsCount: number of prestations selected
        // - updatedArticle.prestationsOther: boolean flag if “other” prestation is checked
        // - updatedArticle.surface: the surface used for category determination

        const surfaceCouvert = Number(updatedArticle.surfaceCouverte) || 0;
        const services = Number(updatedArticle.services?.length) || 0;
        const surfaceTotale = Number(updatedArticle.surfaceTotale) || 0;

        let taux_prestation = 0;
        if (services === 1 || services === 2) {
          taux_prestation = 0.08;
        } else if (services === 3 || services === 4) {
          taux_prestation = 0.1;
        } else if (services === 5 || services === 6) {
          taux_prestation = 0.12;
        }
        // If 6 prestations with an "other" selection, use a higher rate.
        if (services === 6 && updatedArticle.autreService) {
          taux_prestation = 0.14;
        }

        // Determine pris_ref based on surface area categories.
        let pris_ref = 0;
        if (surfaceTotale >= 0 && surfaceTotale <= 100) {
          pris_ref = 150;
        } else if (surfaceTotale >= 101 && surfaceTotale <= 200) {
          pris_ref = 200;
        } else if (surfaceTotale >= 201 && surfaceTotale <= 400) {
          pris_ref = 250;
        } else if (surfaceTotale > 400) {
          pris_ref = 300;
        }

        // Calculate the tax using the built land formula:
        // Taxe = ((surface_couvert * pris_ref * 0.02) * taux_prestation) + ((surface_couvert * pris_ref * 0.02) * 0.04)
        const baseValue = surfaceCouvert * pris_ref * 0.02;
        const taxe = baseValue * taux_prestation + baseValue * 0.04;

        updatedArticle.taxe = taxe;
      } else {
        // Non-built land tax calculation
        // Assume:
        // - updatedArticle.surface_total: total surface area of the land
        // - updatedArticle.densite: the chosen density string ("haute densité", "moyenne densité", "basse densité")
        const surfaceTotal = Number(updatedArticle.surfaceTotale) || 0;
        const densite = updatedArticle.densiteUrbain;

        let prix_densite = 0;
        if (densite === "haute") {
          prix_densite = 0.3;
        } else if (densite === "moyenne") {
          prix_densite = 0.09;
        } else if (densite === "basse") {
          prix_densite = 0.03;
        }

        // Taxe = Surface total * prix_densité
        const taxe = surfaceTotal * prix_densite;
        updatedArticle.taxe = taxe;
        console.log(
          "these are the tax calculating values",
          taxe,
          surfaceTotal,
          prix_densite
        );
      }
      console.log("this is the updatedArticle", updatedArticle);

      if (id) {
        // update
        const result = await db
          .update(articles)
          .set(updatedArticle)
          .where(eq(articles.id, id))
          .returning();
        console.log(result);
        revalidatePath("/articles");
        return {
          success: true,
          data: result[0],
        };
      } else {
        const result = await db
          .insert(articles)
          .values(updatedArticle)
          .returning();
        revalidatePath("/articles");
        return {
          success: true,
          data: result[0],
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Database operation failed",
      };
    }
  });
export const deleteArticle = actionClient
  .schema(z.object({ id: z.number() }))
  .action(async ({ parsedInput: { id } }) => {
    try {
      const data = await db
        .update(articles)
        .set({ archive: true })
        .where(eq(articles.id, id))
        .returning();
      revalidatePath("/articles");
      return { success: `Article archivé avec succès` };
    } catch (error) {
      return { error: error.message || "Une erreur est survenue." };
    }
  });
export const restoreArticle = actionClient
  .schema(z.object({ id: z.number() }))
  .action(async ({ parsedInput: { id } }) => {
    try {
      const data = await db
        .update(articles)
        .set({ archive: false })
        .where(eq(articles.id, id))
        .returning();
      revalidatePath("/articles");
      return { success: `Article restoree avec succès` };
    } catch (error) {
      return { error: error.message || "Une erreur est survenue." };
    }
  });

export const opposeArticle = actionClient
  .schema(z.object({ id: z.number() }))
  .action(async ({ parsedInput: { id } }) => {
    try {
      const data = await db
        .update(articles)
        .set({ status: "opposition_pending" })
        .where(eq(articles.id, id))
        .returning();
      revalidatePath("/articles");
      return { success: `Article opposé avec succès` };
    } catch (error) {
      return { error: error.message || "Une erreur est survenue." };
    }
  });
