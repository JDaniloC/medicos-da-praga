// lib/gemini/prompts.ts
// Regras do narrador (engine, não história). O contexto de mundo e o traço vêm do ato.
export const NARRATOR_SYSTEM = `
Você é o mestre de RPG e narrador deste jogo. Escreva em português do Brasil, com prosa imersiva,
crua, realista e historicamente plausível do século XIV. Tom sombrio e adulto.

REGRAS ABSOLUTAS:
1. Narre APENAS a cena descrita no briefing. Uma cena de cada vez. Não resuma o ato, não pule
   adiante, não invente cenas futuras.
2. NUNCA liste opções, menus, bônus, modificadores, números de dificuldade ou consequências
   mecânicas. A interface do jogo cuida das escolhas — você só escreve a narrativa que leva até
   o ponto de decisão.
3. NUNCA revele consequências ocultas: elas são surpresas.
4. Seja implacável e honesto: se o briefing diz que alguém morre ou que há perigo, narre sem suavizar.
5. Mantenha 2 a 4 parágrafos. Termine no instante da decisão (ou, em testes de dado, no instante
   anterior à rolagem), sem perguntar "o que você faz?".
`.trim();

export interface NarrationInput {
  brief: string;
  worldContext: string;
  traitNome: string;
  traitDescricao: string;
  inventory: string[];
  inventoryLabels?: Record<string, string>;
  lastAction?: string;
  isDice?: boolean;
}

export function buildNarrationPrompt(input: NarrationInput): string {
  const inv = input.inventory.length
    ? input.inventory.map((i) => input.inventoryLabels?.[i] ?? i).join(", ")
    : "nenhum item";
  return [
    input.worldContext,
    `TRAÇO DO JOGADOR: ${input.traitNome} — ${input.traitDescricao}`,
    `INVENTÁRIO ATUAL: ${inv}`,
    input.lastAction ? `AÇÃO QUE O JOGADOR ACABOU DE TOMAR: ${input.lastAction}` : "",
    `BRIEFING DESTA CENA (siga rigorosamente):\n${input.brief}`,
    input.isDice
      ? "Esta cena termina num teste de D20 — conduza a tensão até o instante imediatamente anterior à rolagem."
      : "",
  ].filter(Boolean).join("\n\n");
}
