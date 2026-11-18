import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

import type { Article } from "./export";
import { hostnameOf } from "./export";

export class ConvertError extends Error {
  constructor(
    public title: string,
    public description: string,
  ) {
    super(title);
  }
}

const FETCH_TIMEOUT_MS = 15_000;

export async function convertUrl(url: string): Promise<Article> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; FeedMe/1.0; +https://github.com/CamelGoong/feedme-clone)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    throw new ConvertError(
      "페이지를 가져오지 못했습니다",
      "주소에 연결할 수 없거나 응답이 너무 늦습니다. 주소를 다시 확인해 주세요.",
    );
  }

  if (!response.ok) {
    throw new ConvertError(
      "페이지를 가져오지 못했습니다",
      `사이트가 요청을 거부했습니다(응답 ${response.status}). 로그인이 필요한 페이지이거나 자동 요청을 막는 사이트일 수 있습니다.`,
    );
  }

  const html = await response.text();
  const { document } = parseHTML(html);
  const result = await Defuddle(document as unknown as Document, response.url || url, {
    markdown: true,
  });

  const markdown = (result.content ?? "").trim();
  if (!markdown) {
    throw new ConvertError(
      "본문을 찾지 못했습니다",
      "페이지는 열렸지만 읽을 만한 본문이 없습니다. 자바스크립트로만 내용을 그리는 페이지일 수 있습니다.",
    );
  }

  return {
    url,
    title: (result.title ?? "").trim() || hostnameOf(url),
    author: (result.author ?? "").trim(),
    site: (result.site ?? "").trim(),
    published: (result.published ?? "").trim(),
    markdown,
  };
}
