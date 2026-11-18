import { Converter } from "@/features/url-to-markdown/converter";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Converter />
    </main>
  );
}
