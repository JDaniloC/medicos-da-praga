// lib/builder/validation-utils.ts
// Mapeia mensagens do validateAct (path Zod "nodes.<i>...." ) para o nó correspondente.

export function errorNodeIndex(error: string): number | null {
  const m = /^nodes\.(\d+)(?:\.|:)/.exec(error);
  return m ? Number(m[1]) : null;
}
