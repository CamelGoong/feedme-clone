import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <div className="flex flex-col gap-3.5 text-[15px] leading-7 wrap-anywhere [&_a]:underline [&_a]:underline-offset-3 [&_blockquote]:border-l-3 [&_blockquote]:border-border [&_blockquote]:pl-3.5 [&_blockquote]:text-muted-foreground [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.88em] [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:text-base [&_h3]:font-semibold [&_h4]:font-semibold [&_img]:h-auto [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_td]:border [&_td]:px-2.5 [&_td]:py-1.5 [&_th]:border [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
