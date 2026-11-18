import { expect, test } from "@playwright/test";

test("첫 화면에 주소 입력창과 변환 버튼이 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("FeedMe");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Markdown");
  await expect(page.getByLabel("변환할 페이지 주소")).toBeVisible();
  await expect(page.getByRole("button", { name: "변환" })).toBeVisible();
});
