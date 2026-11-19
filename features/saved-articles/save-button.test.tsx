import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";

const { saveArticle, toastSuccess, toastError } = vi.hoisted(() => ({
  saveArticle: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("./actions", () => ({ saveArticle }));
vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));

import { SaveButton } from "./save-button";

const article = {
  url: "https://stephango.com/saw",
  title: "Use the saw, fear the saw",
  author: "Steph Ango",
  site: "Steph Ango",
  published: "",
  markdown: "본문",
};

beforeEach(() => vi.clearAllMocks());

test("로그인하지 않았으면 저장 대신 로그인 화면으로 가는 안내를 보여 준다", () => {
  render(<SaveButton article={article} signedIn={false} />);
  const link = screen.getByRole("link", { name: "로그인하고 저장" });
  expect(link).toHaveAttribute("href", "/auth/login?next=/");
  expect(screen.queryByRole("button", { name: "저장" })).toBeNull();
});

test("저장에 성공하면 글을 넘기고 저장됨으로 바뀐다", async () => {
  saveArticle.mockResolvedValue({ ok: true });
  render(<SaveButton article={article} signedIn />);
  fireEvent.click(screen.getByRole("button", { name: "저장" }));
  expect(await screen.findByRole("button", { name: "저장됨" })).toBeDisabled();
  expect(saveArticle).toHaveBeenCalledWith(article);
  expect(toastSuccess).toHaveBeenCalled();
});

test("저장에 실패하면 이유를 보여 주고 다시 누를 수 있다", async () => {
  saveArticle.mockResolvedValue({ ok: false, message: "저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요." });
  render(<SaveButton article={article} signedIn />);
  fireEvent.click(screen.getByRole("button", { name: "저장" }));
  expect(await screen.findByRole("button", { name: "저장" })).toBeEnabled();
  expect(toastError).toHaveBeenCalledWith("저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
});

test("다른 글로 바뀌면 다시 저장할 수 있다", async () => {
  saveArticle.mockResolvedValue({ ok: true });
  const { rerender } = render(<SaveButton article={article} signedIn />);
  fireEvent.click(screen.getByRole("button", { name: "저장" }));
  await screen.findByRole("button", { name: "저장됨" });
  rerender(<SaveButton article={{ ...article, url: "https://example.com/" }} signedIn />);
  expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
});
