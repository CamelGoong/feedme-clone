"use client";

import { BookmarkCheckIcon, BookmarkIcon, LogInIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";

import { saveArticle } from "./actions";
import type { ArticleInput } from "./types";

export function SaveButton({ article, signedIn }: { article: ArticleInput; signedIn: boolean }) {
  const [savedFor, setSavedFor] = useState<ArticleInput | null>(null);
  const [pending, setPending] = useState(false);
  const saved = savedFor === article;

  if (!signedIn) {
    return (
      <Link
        href="/auth/login?next=/"
        className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}
      >
        <LogInIcon />
        로그인하고 저장
      </Link>
    );
  }

  async function handleSave() {
    setPending(true);
    try {
      const result = await saveArticle(article);
      if (result.ok) {
        setSavedFor(article);
        toast.success("저장한 글에 담았습니다");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      disabled={saved || pending}
      onClick={handleSave}
    >
      {saved ? <BookmarkCheckIcon /> : <BookmarkIcon />}
      {saved ? "저장됨" : pending ? "저장 중…" : "저장"}
    </Button>
  );
}
