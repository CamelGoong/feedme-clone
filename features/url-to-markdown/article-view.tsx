import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { type Article, hostnameOf } from "./export";
import { ExportPanel } from "./export-panel";
import { MarkdownView } from "./markdown-view";

// Converted article: header and rendered Markdown on the left, export panel on the right.
// `actions` sits above the export panel, e.g. a save button composed by the page.
export function ArticleView({ article, actions }: { article: Article; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1fr)_16rem] md:items-start">
      <article className="order-2 min-w-0 md:order-1">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="text-xl leading-snug font-semibold wrap-anywhere">
              {article.title}
            </CardTitle>
            <ArticleMeta article={article} />
          </CardHeader>
          <CardContent className="py-5">
            <MarkdownView markdown={article.markdown} />
          </CardContent>
        </Card>
      </article>
      <div className="order-1 flex flex-col gap-2 md:sticky md:top-4 md:order-2">
        {actions}
        <ExportPanel key={article.url} article={article} />
      </div>
    </div>
  );
}

function formatPublished(value: string) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ko-KR", { dateStyle: "long", timeZone: "UTC" });
}

function ArticleMeta({ article }: { article: Article }) {
  const host = hostnameOf(article.url);
  const parts = [
    article.author,
    article.site !== article.author && article.site !== host ? article.site : "",
    formatPublished(article.published),
  ].filter(Boolean);
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
      {parts.map((part, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden>·</span>}
          {part}
        </span>
      ))}
      <span aria-hidden>·</span>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="wrap-anywhere underline-offset-3 hover:underline"
      >
        {host}
      </a>
    </div>
  );
}
