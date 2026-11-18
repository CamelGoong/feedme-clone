import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function AccountLink({ signedIn }: { signedIn: boolean }) {
  return (
    <Link
      href={signedIn ? "/settings" : "/auth/login"}
      className={buttonVariants({ variant: "ghost", size: "sm" })}
    >
      {signedIn ? "설정" : "로그인"}
    </Link>
  );
}
