import FormDialog from "@/components/form-dialog";
import { TypographyH1 } from "@/components/ui/heading-1";

import { formatArticleForForm } from "@/lib/utils";
import { getArticles } from "@/server/actions/articles";
import AddEditArticle from "./add-edit-article";
import ArticlesTable from "./articles-table";

export default async function Articles() {
  const articles = await getArticles();
  const formattedArticles = articles.map((article) => {
    return formatArticleForForm(article);
  });

  return (
    <div className="grid gap-12 mt-12">
      <div className="flex items-center justify-between">
        <TypographyH1>Liste des Articles</TypographyH1>
        <FormDialog
          trigger="Ajouter un article"
          title="Ajouter un nouveau article"
        >
          <AddEditArticle />
        </FormDialog>
      </div>
      <ArticlesTable articles={formattedArticles} />
    </div>
  );
}
