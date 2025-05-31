"use client";

import { z } from "zod";
import { articleSchema } from "@/types/articles-schema";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PaymentManager } from "./payments-manager";

export type Article = z.infer<typeof articleSchema>;
interface ArticlesTableProps {
  articles: Article[];
}
// Infer the type from the Zod schema

// Correct function signature
export default function ArticlesTable({ articles }: ArticlesTableProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | undefined>(
    undefined
  );

  const [manageOpen, setManageOpen] = useState(false);

  const handleCompare = async (article: Article) => {
    setSelectedArticle(article);
    setManageOpen(true);
  };

  return (
    <>
      <DataTable data={articles} columns={columns(handleCompare)} />
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogTitle>Manage Payments</DialogTitle>
          {selectedArticle ? (
            <PaymentManager
              article={selectedArticle}
              onClose={() => setManageOpen(false)}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <p className="text-gray-500">No article selected</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
