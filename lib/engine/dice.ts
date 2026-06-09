// lib/engine/dice.ts
// RNG injetável para tornar a engine testável de forma determinística.
export type Rng = () => number;

export const defaultRng: Rng = () => Math.random();

// Rola um D20 (1..20). Em testes, injete um rng fixo.
export function rollD20(rng: Rng = defaultRng): number {
  return Math.floor(rng() * 20) + 1;
}

// Mantém a dificuldade dentro de limites jogáveis.
export function clampDifficulty(n: number): number {
  return Math.max(2, Math.min(20, n));
}

export function succeeds(roll: number, difficulty: number): boolean {
  return roll >= difficulty;
}
