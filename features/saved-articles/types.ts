export type ArticleInput = {
  url: string;
  title: string;
  author: string;
  site: string;
  published: string;
  markdown: string;
};

export type SavedArticle = ArticleInput & { id: string; saved_at: string };

export type SavedArticleSummary = Pick<SavedArticle, "id" | "url" | "title" | "author" | "saved_at">;
