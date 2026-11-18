import { ConvertError, convertUrl } from "@/features/url-to-markdown/convert";
import { normalizeUrl } from "@/features/url-to-markdown/export";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const url = typeof body?.url === "string" ? normalizeUrl(body.url) : null;
  if (!url) {
    return Response.json(
      {
        error: {
          title: "올바른 주소가 아닙니다",
          description: "“https://”로 시작하는 웹 페이지 주소를 입력해 주세요.",
        },
      },
      { status: 400 },
    );
  }

  try {
    return Response.json({ article: await convertUrl(url) });
  } catch (error) {
    if (error instanceof ConvertError) {
      return Response.json(
        { error: { title: error.title, description: error.description } },
        { status: 502 },
      );
    }
    return Response.json(
      {
        error: {
          title: "본문을 찾지 못했습니다",
          description: "페이지를 읽는 중 문제가 생겼습니다. 다른 주소로 다시 시도해 주세요.",
        },
      },
      { status: 500 },
    );
  }
}
