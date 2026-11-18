export type Article = {
  url: string;
  title: string;
  author: string;
  site: string;
  published: string;
  markdown: string;
};

export type ChatService = "chatgpt" | "claude";

export const CHAT_SERVICES: Record<ChatService, { name: string; base: string }> = {
  chatgpt: { name: "ChatGPT", base: "https://chatgpt.com/" },
  claude: { name: "Claude", base: "https://claude.ai/new" },
};

// 인코딩한 텍스트 기준 길이 상한. 이보다 길면 주소 대신 클립보드로 넘긴다.
export const CHAT_TEXT_LIMIT = 8000;

export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    if (!parsed.hostname.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function buildExportMarkdown(article: Article): string {
  return `# ${article.title}\n\n원문: ${article.url}\n\n${article.markdown}\n`;
}

export function buildFileName(article: Article): string {
  const base = article.title.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 80);
  return `${base || hostnameOf(article.url)}.md`;
}

export type ChatHandoff =
  | { kind: "url"; url: string }
  | { kind: "clipboard"; text: string; url: string };

export function buildChatHandoff(
  service: ChatService,
  prompt: string,
  article: Article,
): ChatHandoff {
  const { base } = CHAT_SERVICES[service];
  const text = (prompt ? `${prompt}\n\n` : "") + buildExportMarkdown(article);
  const encoded = encodeURIComponent(text);
  if (encoded.length <= CHAT_TEXT_LIMIT) {
    return { kind: "url", url: `${base}?q=${encoded}` };
  }
  return {
    kind: "clipboard",
    text,
    url: prompt ? `${base}?q=${encodeURIComponent(prompt)}` : base,
  };
}
