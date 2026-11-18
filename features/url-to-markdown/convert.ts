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

// EUC-KR 등 UTF-8이 아닌 페이지가 깨지지 않도록 헤더와 meta의 charset으로 디코딩한다.
function decodeHtml(buffer: ArrayBuffer, contentType: string | null): string {
  const head = new TextDecoder("latin1").decode(buffer.slice(0, 2048));
  const charset =
    /charset=["']?([\w-]+)/i.exec(contentType ?? "")?.[1] ??
    /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1] ??
    "utf-8";
  try {
    return new TextDecoder(charset).decode(buffer);
  } catch {
    return new TextDecoder("utf-8").decode(buffer);
  }
}

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

  const html = decodeHtml(await response.arrayBuffer(), response.headers.get("content-type"));
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
