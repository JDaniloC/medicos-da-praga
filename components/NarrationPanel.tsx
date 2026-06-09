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
      <div className="space-y-3 opacity-40">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-edge" />
        ))}
        <div className="h-4 w-2/3 animate-pulse rounded bg-edge" />
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
