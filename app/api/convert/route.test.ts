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
