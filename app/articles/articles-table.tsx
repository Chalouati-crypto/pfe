"use client";

import { DataTable } from "./data-table";
import { z } from "zod";
import { articleSchema } from "@/types/articles-schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";
import AddEditArticle from "./add-edit-article";
import { useArticleNoticeStore } from "@/stores/article-notice-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { columns as allColumns } from "./all-articles-columns";
import { columns as opposedColumns } from "./opposed-articles-columns";
import { columns as archivedColumns } from "./archived-articles-columns";
import { AddOppositionForm } from "../oppositions/add-opposition";
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
  const [showOppositionForm, setShowOppositionForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const openNotice = useArticleNoticeStore((state) => state.openNotice);
  const openOppositionForm = (article: Article) => {
    setSelectedArticle(article);
    setShowOppositionForm(true);
  };
  const archivedArticles = articles.filter((article) => article.archive);
  const allArticles = articles.filter((article) => !article.archive);

  const opposedArticles = articles.filter(
    (article) => article.status !== "active" && !article.archive
  );
  return (
    <>
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-xl rounded-none">
          <TabsTrigger className="rounded-none cursor-pointer" value="all">
            Tous les articles
          </TabsTrigger>
          <TabsTrigger className="rounded-none cursor-pointer" value="pending">
            Articles en opposition
          </TabsTrigger>
          <TabsTrigger className="rounded-none cursor-pointer" value="archived">
            Articles dans L&apos;archive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DataTable
            data={allArticles}
            columns={allColumns(openNotice, openOppositionForm)}
          />
        </TabsContent>

        <TabsContent value="pending">
          <DataTable
            data={opposedArticles}
            columns={opposedColumns(openNotice)}
          />
        </TabsContent>

        <TabsContent value="archived">
          <DataTable
            data={archivedArticles}
            columns={archivedColumns(openNotice)}
          />
        </TabsContent>
      </Tabs>
      {
        <Dialog open={showOppositionForm} onOpenChange={setShowOppositionForm}>
          <DialogContent className="min-w-[50vw] h-[95vh] flex flex-col gap-6">
            <DialogTitle>Opposer l&apos;article</DialogTitle>
            {selectedArticle && (
              <AddOppositionForm
                articleId={selectedArticle.id}
                currentSurfaceCouverte={selectedArticle.surfaceCouverte}
                currentServices={selectedArticle.services}
                currentAutreService={selectedArticle.autreService}
                handleClose={() => setShowOppositionForm(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      }
    </>
  );
}
