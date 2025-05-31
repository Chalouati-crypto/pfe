"use client";

import { Opposition } from "@/types/oppositions-schema";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { OppositionComparison } from "./opposition-comparison";
import { useAction } from "next-safe-action/hooks";
import { getArticleById } from "@/server/actions/articles";
import { Article } from "@/types/articles-schema";
import { toast } from "sonner";
import { DialogTitle } from "@radix-ui/react-dialog";

// Correct function signature
export default function OppositionsTable({ oppositions }: Opposition[]) {
  const [selectedOpposition, setSelectedOpposition] = useState<
    Opposition | undefined
  >(undefined);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const [compareOpen, setCompareOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompare = async (opposition: Opposition) => {
    try {
      setIsLoading(true);
      setSelectedOpposition(opposition);

      // Call the server action directly
      const articleData = await getArticleById({ id: opposition.articleId });

      if (articleData) {
        setSelectedArticle(articleData);
        setCompareOpen(true);
        console.log("Article data:", articleData);
      } else {
        toast.error("Article not found");
      }
    } catch (error) {
      console.error("Error loading article:", error);
      toast.error("Failed to load article data");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <DataTable data={oppositions} columns={columns(handleCompare)} />
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogTitle>Review Opposition</DialogTitle>
          {selectedArticle && selectedOpposition ? (
            <OppositionComparison
              opposition={selectedOpposition!}
              article={selectedArticle}
              onClose={() => setCompareOpen(false)}
            />
          ) : (
            <div className="py-12 text-center">
              {isLoading ? (
                <p className="text-muted-foreground">Loading article data...</p>
              ) : (
                <p className="text-muted-foreground">
                  Article data not available
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
