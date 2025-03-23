"use server";
import { db } from "..";
import { articles } from "../schema";
import { articlesSchema } from "@/types/articles-schema";
import { eq } from "drizzle-orm";
import { actionClient } from "@/lib/safe-actions";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getArticles() {
  return db.select().from(articles);
}

export const upsertArticle = actionClient
  .schema(articlesSchema)
  .action(async ({ parsedInput }) => {
    try {
      const values = parsedInput;
      console.log("these are the fields broooo", values);
      const { id } = values.general;
      const updatedArticle = {
        ...values?.bati_details,
        ...values.general,
        ...values.location,
        ...values.owner,
      };

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
        .delete(articles)
        .where(eq(articles.id, id))
        .returning();
      revalidatePath("/articles");
      return { success: `Article supprimee avec succes` };
    } catch (error) {
      return { error: error };
    }
  });
