import { expect, test } from "vitest";

import {
  type Article,
  CHAT_TEXT_LIMIT,
  buildChatHandoff,
  buildExportMarkdown,
  buildFileName,
  normalizeUrl,
} from "./export";

const article: Article = {
  url: "https://example.com/post",
  title: "제목: 테스트?",
  author: "",
  site: "",
  published: "",
  markdown: "본문입니다.",
};

test("https를 빼고 입력하면 붙여서 처리하고, 주소가 아니면 null을 돌려준다", () => {
  expect(normalizeUrl("example.com/a")).toBe("https://example.com/a");
  expect(normalizeUrl("  https://example.com/  ")).toBe("https://example.com/");
  expect(normalizeUrl("")).toBeNull();
  expect(normalizeUrl("아무 말")).toBeNull();
  expect(normalizeUrl("localhost")).toBeNull();
});

test("내보내는 Markdown은 제목과 원문 주소를 맨 앞에 붙인다", () => {
  expect(buildExportMarkdown(article)).toBe(
    "# 제목: 테스트?\n\n원문: https://example.com/post\n\n본문입니다.\n",
  );
});

test("파일 이름은 금지 문자를 빼고, 제목이 비면 도메인을 쓴다", () => {
  expect(buildFileName(article)).toBe("제목 테스트.md");
  expect(buildFileName({ ...article, title: "" })).toBe("example.com.md");
});

test("짧은 텍스트는 프롬프트 없이 Markdown만 주소에 담는다", () => {
  const handoff = buildChatHandoff("chatgpt", "", article);
  expect(handoff.kind).toBe("url");
  expect(handoff.url).toBe(
    `https://chatgpt.com/?q=${encodeURIComponent(buildExportMarkdown(article))}`,
  );
});

test("프롬프트를 고르면 프롬프트 다음 줄부터 Markdown이 이어진다", () => {
  const handoff = buildChatHandoff("claude", "다음 글을 요약해줘.", article);
  expect(handoff.kind).toBe("url");
  expect(decodeURIComponent(handoff.url.split("?q=")[1])).toBe(
    `다음 글을 요약해줘.\n\n${buildExportMarkdown(article)}`,
  );
});

test("길이 기준을 넘으면 전체 텍스트는 클립보드로, 주소에는 프롬프트만 담는다", () => {
  const long = { ...article, markdown: "가".repeat(CHAT_TEXT_LIMIT) };
  const withPrompt = buildChatHandoff("claude", "다음 글을 요약해줘.", long);
  expect(withPrompt).toMatchObject({
    kind: "clipboard",
    text: `다음 글을 요약해줘.\n\n${buildExportMarkdown(long)}`,
    url: `https://claude.ai/new?q=${encodeURIComponent("다음 글을 요약해줘.")}`,
  });
  expect(buildChatHandoff("chatgpt", "", long)).toMatchObject({
    kind: "clipboard",
    url: "https://chatgpt.com/",
  });
});
