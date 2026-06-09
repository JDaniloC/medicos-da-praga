// app/builder/(protected)/acts/[act]/page.tsx
import { notFound } from "next/navigation";
import { ActEditor } from "@/components/builder/ActEditor";

export default async function EditActPage({ params }: { params: Promise<{ act: string }> }) {
  const { act } = await params;
  const n = Number(act);
  if (!Number.isInteger(n) || n <= 0) notFound();
  return <ActEditor act={n} />;
}
