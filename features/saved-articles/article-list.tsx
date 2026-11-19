import { BookmarkIcon } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import type { SavedArticleSummary } from "./types";

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function formatSavedAt(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", { dateStyle: "long", timeZone: "Asia/Seoul" });
}

export function ArticleList({ articles }: { articles: SavedArticleSummary[] }) {
  if (articles.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia>
            <BookmarkIcon />
          </EmptyMedia>
          <EmptyTitle>아직 저장한 글이 없습니다</EmptyTitle>
          <EmptyDescription>글을 변환한 뒤 결과 화면에서 저장을 눌러 보세요.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card className="gap-0 py-0">
      <ul aria-label="저장한 글 목록" className="divide-y">
        {articles.map((article) => (
          <li key={article.id}>
            <Link
              href={`/articles/${article.id}`}
              className="flex flex-col gap-1 px-4 py-3.5 transition-colors hover:bg-muted/50"
            >
              <span className="font-medium leading-snug wrap-anywhere">{article.title}</span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
                {[article.author, hostnameOf(article.url), `${formatSavedAt(article.saved_at)} 저장`]
                  .filter(Boolean)
                  .map((part, index) => (
                    <span key={index} className="flex items-center gap-2 wrap-anywhere">
                      {index > 0 && <span aria-hidden>·</span>}
                      {part}
                    </span>
                  ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
