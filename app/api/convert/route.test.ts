import { afterEach, expect, test, vi } from "vitest";

import { POST } from "./route";

const html = `<!doctype html><html><head><title>Hello</title>
<meta name="author" content="Jane Doe"></head><body>
<nav>menu menu menu</nav>
<article><h1>Hello</h1><p>${"본문 문장입니다. ".repeat(40)}</p></article>
</body></html>`;

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/convert", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
}

afterEach(() => vi.unstubAllGlobals());

test("URL 형식이 아니면 400과 이유를 돌려준다", async () => {
  const response = await post({ url: "아무 말" });
  expect(response.status).toBe(400);
  expect((await response.json()).error.title).toBe("올바른 주소가 아닙니다");
});

test("페이지를 가져오지 못하면 상태 코드를 담은 오류를 돌려준다", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("no", { status: 403 })));
  const response = await post({ url: "https://example.com/" });
  expect(response.status).toBe(502);
  expect((await response.json()).error.description).toContain("403");
});

test("본문을 추출해 제목과 Markdown을 돌려주고, 저자가 없으면 빈 문자열이다", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(html, { headers: { "content-type": "text/html" } })),
  );
  const response = await post({ url: "https://example.com/hello" });
  expect(response.status).toBe(200);
  const { article } = await response.json();
  expect(article.title).toBe("Hello");
  expect(article.markdown).toContain("본문 문장입니다");
  expect(article.markdown).not.toContain("undefined");
});

test("EUC-KR 페이지도 charset에 맞게 디코딩해 한글이 깨지지 않는다", async () => {
  // "한글 본문" 반복을 EUC-KR 바이트로 만든다.
  const bytes = [0xc7, 0xd1, 0xb1, 0xdb, 0x20, 0xba, 0xbb, 0xb9, 0xae, 0x20];
  const body = Buffer.concat([
    Buffer.from("<html><head><title>"),
    Buffer.from(bytes),
    Buffer.from("</title></head><body><article><p>"),
    Buffer.from(Array.from({ length: 60 }, () => bytes).flat()),
    Buffer.from("</p></article></body></html>"),
  ]);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(body, { headers: { "content-type": "text/html; charset=EUC-KR" } }),
    ),
  );
  const { article } = await (await post({ url: "https://example.com/kr" })).json();
  expect(article.title).toContain("한글 본문");
  expect(article.markdown).toContain("한글 본문");
});
