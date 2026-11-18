"use client";

import { LinkIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  loading: boolean;
};

export function UrlForm({ value, onChange, onSubmit, onClear, loading }: Props) {
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!loading) onSubmit();
      }}
    >
      <InputGroup className="h-10">
        <InputGroupAddon>
          <LinkIcon />
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://example.com/article"
          aria-label="변환할 페이지 주소"
          value={value}
          readOnly={loading}
          onChange={(event) => onChange(event.target.value)}
        />
        {value && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label="지우기"
              title="지우기"
              onClick={onClear}
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      <Button type="submit" size="lg" className="sm:px-4" disabled={loading}>
        {loading ? "변환 중…" : "변환"}
      </Button>
    </form>
  );
}
