"use client";

import {
  ArrowUpRightIcon,
  CheckIcon,
  ClipboardCheckIcon,
  CopyIcon,
  DownloadIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  type Article,
  CHAT_SERVICES,
  type ChatService,
  buildChatHandoff,
  buildExportMarkdown,
  buildFileName,
} from "./export";

const PRESETS = [
  { id: "none", label: "없음", prompt: "" },
  { id: "summary", label: "요약해줘", prompt: "다음 글을 요약해줘." },
  { id: "translate", label: "한국어로 번역해줘", prompt: "다음 글을 한국어로 번역해줘." },
  { id: "explain", label: "쉽게 설명해줘", prompt: "다음 글을 쉽게 설명해줘." },
  { id: "custom", label: "직접 입력", prompt: "" },
] as const;

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function ExportPanel({ article }: { article: Article }) {
  const [presetId, setPresetId] = useState<string>("none");
  const [customPrompt, setCustomPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<{ service: ChatService; withPrompt: boolean } | null>(
    null,
  );

  const markdown = buildExportMarkdown(article);

  const currentPrompt = () => {
    if (presetId === "custom") return customPrompt.trim();
    return PRESETS.find((preset) => preset.id === presetId)?.prompt ?? "";
  };

  async function handleCopy() {
    if (await copyToClipboard(markdown)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast.success("Markdown을 클립보드에 복사했습니다");
    } else {
      toast.error("클립보드에 복사하지 못했습니다");
    }
  }

  function handleDownload() {
    const name = buildFileName(article);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([markdown], { type: "text/markdown" }));
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(`${name} 파일을 저장했습니다`);
  }

  async function handleOpen(service: ChatService) {
    const prompt = currentPrompt();
    const handoff = buildChatHandoff(service, prompt, article);
    if (handoff.kind === "url") {
      setNotice(null);
      window.open(handoff.url, "_blank", "noopener");
      return;
    }
    const ok = await copyToClipboard(handoff.text);
    window.open(handoff.url, "_blank", "noopener");
    if (ok) setNotice({ service, withPrompt: Boolean(prompt) });
    else toast.error("클립보드에 복사하지 못했습니다");
  }

  return (
    <Card aria-label="내보내기" className="gap-0 py-0">
      <section className="flex flex-col gap-2.5 p-3.5">
        <h2 className="flex items-baseline justify-between gap-2 text-[13px] font-medium">
          내보내기
          <span className="text-xs font-normal text-muted-foreground">
            Markdown {markdown.length.toLocaleString("ko-KR")}자
          </span>
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "복사됨" : "복사하기"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <DownloadIcon />
            .md
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-2.5 border-t p-3.5">
        <h2 className="text-[13px] font-medium">프롬프트</h2>
        <ToggleGroup
          aria-label="프롬프트 선택"
          variant="outline"
          size="sm"
          spacing={1}
          className="max-md:flex-wrap md:w-full md:flex-col md:items-stretch"
          value={[presetId]}
          onValueChange={(value) => {
            if (value[0]) setPresetId(value[0]);
          }}
        >
          {PRESETS.map((preset) => (
            <ToggleGroupItem
              key={preset.id}
              value={preset.id}
              className="aria-pressed:bg-primary aria-pressed:text-primary-foreground md:justify-start"
            >
              {preset.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {presetId === "custom" && (
          <Input
            type="text"
            placeholder="예: 실천할 것만 뽑아줘"
            aria-label="직접 입력한 프롬프트"
            value={customPrompt}
            autoFocus
            onChange={(event) => setCustomPrompt(event.target.value)}
          />
        )}
      </section>

      <section className="flex flex-col gap-2.5 border-t p-3.5">
        <h2 className="text-[13px] font-medium">LLM으로 열기</h2>
        <div className="flex gap-2 md:flex-col">
          {(Object.keys(CHAT_SERVICES) as ChatService[]).map((service) => (
            <Button
              key={service}
              size="sm"
              className="max-md:flex-1"
              onClick={() => handleOpen(service)}
            >
              {CHAT_SERVICES[service].name}로 열기
              <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
          ))}
        </div>
        {notice && (
          <Alert role="status">
            <ClipboardCheckIcon />
            <AlertTitle>본문이 길어 클립보드에 복사했습니다</AlertTitle>
            <AlertDescription>
              새 탭의 {CHAT_SERVICES[notice.service].name} 채팅 입력창에 붙여넣기(Ctrl+V) 한 뒤
              보내세요.{notice.withPrompt && " 프롬프트도 함께 복사됐습니다."}
            </AlertDescription>
          </Alert>
        )}
      </section>
    </Card>
  );
}
