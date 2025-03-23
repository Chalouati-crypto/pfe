"use client";

import { DataTable } from "@/components/ui/data-table";
import { z } from "zod";
import { articlesSchema } from "@/types/articles-schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";
import AddEditArticle from "./add-edit-article";
import { columns } from "./columns";
export type Article = z.infer<typeof articlesSchema>;
interface ArticlesTableProps {
  articles: Article[]; // ✅ This ensures it's an array of actual objects, not Zod schemas
}
// Infer the type from the Zod schema

// Correct function signature
export default function ArticlesTable({ articles }: ArticlesTableProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | undefined>(
    undefined
  );
  const [open, setOpen] = useState(false);

  const handleEdit = (article: Article) => {
    setSelectedArticle(article); // State update is asynchronous
    setOpen(true);
  };

  return (
    <>
      <DataTable data={articles} columns={columns(handleEdit)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-[50vw] h-[95vh] flex flex-col gap-6">
          <DialogTitle>Modifier l&apos;article</DialogTitle>
          <AddEditArticle
            article={selectedArticle}
            handleClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
