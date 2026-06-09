// lib/builder/immutable.ts
// Helpers de atualização imutável de listas — usados pelos editores controlados do builder.

export function replaceAt<T>(arr: T[], index: number, item: T): T[] {
  return arr.map((x, i) => (i === index ? item : x));
}

export function removeAt<T>(arr: T[], index: number): T[] {
  return arr.filter((_, i) => i !== index);
}

export function insertAt<T>(arr: T[], index: number, item: T): T[] {
  return [...arr.slice(0, index), item, ...arr.slice(index)];
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length || from < 0 || from >= arr.length) return arr;
  const out = [...arr];
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}
