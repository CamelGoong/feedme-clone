"use server";

import { createClient } from "@/lib/supabase/server";

export type UpdateProfileState = { ok: boolean; message: string } | null;

export async function updateDisplayName(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return { ok: false, message: "로그인이 필요합니다." };

  const displayName = String(formData.get("display_name") ?? "").trim();
  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName || null })
    .eq("id", auth.claims.sub)
    .select("id");

  if (error || !data?.length) {
    return { ok: false, message: "저장하지 못했습니다." };
  }
  return { ok: true, message: "저장했습니다." };
}
