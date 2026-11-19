"use server";

import { createClient } from "@/lib/supabase/server";

import type { ArticleInput } from "./types";

export type SaveArticleResult = { ok: true } | { ok: false; message: string };

const FAILED = "저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요.";

export async function saveArticle(article: ArticleInput): Promise<SaveArticleResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return { ok: false, message: "로그인이 필요합니다." };

  // Saving the same URL again overwrites the row and moves it to the top.
  const { error } = await supabase.from("articles").upsert(
    {
      user_id: auth.claims.sub,
      url: article.url,
      title: article.title,
      author: article.author ?? "",
      site: article.site ?? "",
      published: article.published ?? "",
      markdown: article.markdown,
      saved_at: new Date().toISOString(),
    },
    { onConflict: "user_id,url" },
  );

  return error ? { ok: false, message: FAILED } : { ok: true };
}
