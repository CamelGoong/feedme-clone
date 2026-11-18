import { createClient } from "@/lib/supabase/server";

import type { SavedArticle, SavedArticleSummary } from "./types";

// Row access is limited to the owner by RLS, so no user filter is needed here.
export async function listSavedArticles(): Promise<SavedArticleSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, url, title, author, saved_at")
    .order("saved_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getSavedArticle(id: string): Promise<SavedArticle | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("id, url, title, author, site, published, markdown, saved_at")
    .eq("id", id)
    .maybeSingle();
  // An unknown, foreign, or malformed id all read as "not found".
  return data;
}
