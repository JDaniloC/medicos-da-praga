// lib/engine/types.ts
// Estado genérico: nenhum traço/flag/item é fixo aqui — tudo vem da DSL do ato.

export type PatientResult = "sucesso" | "fracasso";

export interface GameState {
  trait: string;
  inventory: string[];
  currentNodeId: string;
  flags: Record<string, boolean>;     // ausente = false
  treatments: Record<string, string>;
  patients: Record<string, PatientResult>;
  rolls: { reason: string; roll: number; difficulty: number; success: boolean }[];
}
