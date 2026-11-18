"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDisplayName } from "./actions";

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState(updateDisplayName, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="display_name">표시 이름</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={displayName}
          maxLength={50}
        />
      </div>
      {state && (
        <p
          className={
            state.ok ? "text-sm text-muted-foreground" : "text-sm text-red-500"
          }
        >
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
