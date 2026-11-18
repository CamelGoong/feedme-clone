"use client";

import { CircleAlertIcon, FileTextIcon } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import { type Article, hostnameOf, normalizeUrl } from "./export";
import { ExportPanel } from "./export-panel";
import { MarkdownView } from "./markdown-view";
import { ThemeToggle } from "./theme-toggle";
import { UrlForm } from "./url-form";

type ErrorInfo = { title: string; description: string };
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: ErrorInfo }
  | { status: "result"; article: Article };

const NETWORK_ERROR: ErrorInfo = {
  title: "페이지를 가져오지 못했습니다",
  description: "서버에 연결하지 못했습니다. 잠시 뒤에 다시 시도해 주세요.",
};

const INVALID_URL_ERROR: ErrorInfo = {
  title: "올바른 주소가 아닙니다",
  description: "“https://”로 시작하는 웹 페이지 주소를 입력해 주세요.",
};

export function Converter() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit() {
    if (!input.trim()) return;
    const url = normalizeUrl(input);
    if (!url) {
      setState({ status: "error", error: INVALID_URL_ERROR });
      return;
    }
    setInput(url);
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await response.json()) as { article?: Article; error?: ErrorInfo };
      if (data.article) setState({ status: "result", article: data.article });
      else setState({ status: "error", error: data.error ?? NETWORK_ERROR });
    } catch {
      setState({ status: "error", error: NETWORK_ERROR });
    }
  }

  function handleClear() {
    setInput("");
    setState({ status: "idle" });
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-4 pb-12 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[15px] font-semibold">
          <span className="grid size-6.5 place-items-center rounded-md bg-primary font-mono text-[13px] text-primary-foreground">
            M↓
          </span>
          FeedMe
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-[28px]">
          웹 페이지를 Markdown으로
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          주소를 붙여넣으면 광고와 메뉴를 걷어낸 본문만 Markdown으로 바꿔 드립니다. 복사하거나
          ChatGPT·Claude로 바로 넘겨 보세요.
        </p>
      </div>

      <UrlForm
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        onClear={handleClear}
        loading={state.status === "loading"}
      />

      {state.status === "idle" && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia>
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>아직 변환한 페이지가 없습니다</EmptyTitle>
            <EmptyDescription>블로그 글, 문서, 뉴스 기사 주소를 넣어 보세요.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {state.status === "loading" && (
        <Card aria-live="polite" aria-label="변환 중">
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-5.5 w-3/5" />
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="mt-2.5 h-3.5 w-full" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-4/5" />
          </CardContent>
        </Card>
      )}

      {state.status === "error" && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>{state.error.title}</AlertTitle>
          <AlertDescription>{state.error.description}</AlertDescription>
        </Alert>
      )}

      {state.status === "result" && (
        <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1fr)_16rem] md:items-start">
          <article className="order-2 min-w-0 md:order-1">
            <Card className="gap-0 py-0">
              <CardHeader className="border-b py-4">
                <CardTitle className="text-xl leading-snug font-semibold wrap-anywhere">
                  {state.article.title}
                </CardTitle>
                <ArticleMeta article={state.article} />
              </CardHeader>
              <CardContent className="py-5">
                <MarkdownView markdown={state.article.markdown} />
              </CardContent>
            </Card>
          </article>
          <div className="order-1 md:sticky md:top-4 md:order-2">
            <ExportPanel key={state.article.url} article={state.article} />
          </div>
        </div>
      )}
    </div>
  );
}

function formatPublished(value: string) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ko-KR", { dateStyle: "long", timeZone: "UTC" });
}

function ArticleMeta({ article }: { article: Article }) {
  const host = hostnameOf(article.url);
  const parts = [
    article.author,
    article.site !== article.author && article.site !== host ? article.site : "",
    formatPublished(article.published),
  ].filter(Boolean);
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
      {parts.map((part, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden>·</span>}
          {part}
        </span>
      ))}
      <span aria-hidden>·</span>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="wrap-anywhere underline-offset-3 hover:underline"
      >
        {host}
      </a>
    </div>
  );
}
