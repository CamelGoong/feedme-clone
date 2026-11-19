import { redirect } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { AccountLink } from "@/features/auth/account-link";
import { ArticleList } from "@/features/saved-articles/article-list";
import { listSavedArticles } from "@/features/saved-articles/queries";
import { createClient } from "@/lib/supabase/server";

export default async function ArticlesPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/auth/login?next=/articles");

  const articles = await listSavedArticles();

  return (
    <SiteShell headerActions={<AccountLink signedIn />}>
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-[28px]">
          저장한 글
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          내가 저장한 글만 보입니다. 최근에 저장한 글이 위에 있습니다.
        </p>
      </div>
      <ArticleList articles={articles} />
    </SiteShell>
  );
}
