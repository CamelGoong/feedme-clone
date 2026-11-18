import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoutButton } from "@/features/auth/logout-button";
import { ProfileForm } from "@/features/profile/profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/auth/login?next=/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", auth.claims.sub)
    .maybeSingle();

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>설정</CardTitle>
            <CardDescription>{auth.claims.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm displayName={profile?.display_name ?? ""} />
          </CardContent>
        </Card>
        <LogoutButton />
      </div>
    </main>
  );
}
