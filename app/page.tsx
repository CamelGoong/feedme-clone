import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { SiteShell } from "@/components/site-shell";
import { AccountLink } from "@/features/auth/account-link";
import { createClient } from "@/lib/supabase/server";

import { HomeConverter } from "./home-converter";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;

  return (
    <SiteShell
      headerActions={
        <>
          {signedIn && (
            <Link href="/articles" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              저장한 글
            </Link>
          )}
          <AccountLink signedIn={signedIn} />
        </>
      }
    >
      <HomeConverter signedIn={signedIn} />
    </SiteShell>
  );
}
