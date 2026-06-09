"use client";

import { SpeakButton } from "./SpeakButton";

export function NarrationPanel({
  text,
  loading,
}: {
  text: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4 py-2">
        <div className="flex flex-col gap-3">
          <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-[92%] animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-[85%] animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="h-4 w-[60%] animate-pulse rounded-full bg-slate-200" />
      </div>
    );
  }
  return (
    <div className="fade-in">
      {text && (
        <div className="mb-3 flex justify-end">
          <SpeakButton text={text} />
        </div>
      )}
      <div className="prose-narrativa text-[1.1rem] font-medium text-ink">{text}</div>
    </div>
  );
}
