import { TypographyH1 } from "@/components/ui/heading-1";

import { getArticles } from "@/server/actions/articles";
import ArticlesTable from "./articles-table";

export default async function Payments() {
  const articles = await getArticles();

  console.log(articles);

  return (
    <div className="grid gap-12 mt-12">
      <div className="flex items-center justify-between">
        <TypographyH1>Liste des Articles</TypographyH1>
      </div>
      <ArticlesTable articles={articles} />
    </div>
  );
}
