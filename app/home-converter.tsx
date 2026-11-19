"use client";

import { SaveButton } from "@/features/saved-articles/save-button";
import { Converter } from "@/features/url-to-markdown/converter";

// Composes the converter with saving. Lives here so the two features stay unaware of each other.
export function HomeConverter({ signedIn }: { signedIn: boolean }) {
  return (
    <Converter
      renderActions={(article) => <SaveButton article={article} signedIn={signedIn} />}
    />
  );
}
