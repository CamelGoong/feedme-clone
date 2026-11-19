import { ArrowLeftIcon, FileQuestionIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SiteShell } from "@/components/site-shell";
import { AccountLink } from "@/features/auth/account-link";
import { getSavedArticle } from "@/features/saved-articles/queries";
import { ArticleView } from "@/features/url-to-markdown/article-view";
import { createClient } from "@/lib/supabase/server";

export default async function SavedArticlePage({ params }: PageProps<"/articles/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect(`/auth/login?next=/articles/${encodeURIComponent(id)}`);

  const article = await getSavedArticle(id);

  return (
    <SiteShell headerActions={<AccountLink signedIn />}>
      <Link
        href="/articles"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "self-start" })}
      >
        <ArrowLeftIcon />
        저장한 글
      </Link>
      {article ? (
        <ArticleView article={article} />
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia>
              <FileQuestionIcon />
            </EmptyMedia>
            <EmptyTitle>글을 찾을 수 없습니다</EmptyTitle>
            <EmptyDescription>
              삭제됐거나 내가 저장한 글이 아닙니다. 저장한 글 목록에서 다시 골라 주세요.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/articles" className={buttonVariants({ variant: "outline", size: "sm" })}>
              저장한 글 목록으로
            </Link>
          </EmptyContent>
        </Empty>
      )}
    </SiteShell>
  );
}
