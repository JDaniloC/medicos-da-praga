// lib/builder/record-utils.ts
// Conversões record↔pares para editar items/badges (Record<id, rótulo>) como lista de linhas.

export type KeyValuePair = { key: string; label: string };

export function recordToPairs(record: Record<string, string> | undefined): KeyValuePair[] {
  return Object.entries(record ?? {}).map(([key, label]) => ({ key, label }));
}

export function pairsToRecord(pairs: KeyValuePair[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { key, label } of pairs) {
    if (key) out[key] = label;
  }
  return out;
}

export function duplicateKeys(pairs: KeyValuePair[]): string[] {
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const { key } of pairs) {
    if (!key) continue;
    if (seen.has(key)) dups.add(key);
    seen.add(key);
  }
  return [...dups];
}
