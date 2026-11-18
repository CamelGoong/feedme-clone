import { AccountLink } from "@/features/auth/account-link";
import { Converter } from "@/features/url-to-markdown/converter";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <main className="flex flex-1 flex-col">
      <Converter headerActions={<AccountLink signedIn={!!data?.claims} />} />
    </main>
  );
}
