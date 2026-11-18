import Link from "next/link";

import { ThemeToggle } from "./theme-toggle";

// Shared page shell: content width, gutters, and the header with the logo.
export function SiteShell({
  headerActions,
  children,
}: {
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-4 pb-12 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold">
            <span className="grid size-6.5 place-items-center rounded-md bg-primary font-mono text-[13px] text-primary-foreground">
              M↓
            </span>
            FeedMe
          </Link>
          <div className="flex items-center gap-1">
            {headerActions}
            <ThemeToggle />
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
