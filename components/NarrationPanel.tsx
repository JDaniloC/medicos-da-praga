"use client";

export function NarrationPanel({
  text,
  loading,
}: {
  text: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-stone-800" />
        ))}
        <div className="h-4 w-2/3 animate-pulse rounded bg-stone-800" />
      </div>
    );
  }
  return <div className="prose-narrativa fade-in text-[1.05rem] text-stone-200">{text}</div>;
}
