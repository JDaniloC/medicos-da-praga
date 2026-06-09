// lib/storage/save.ts
import type { GameState } from "../engine/types";

const SAVE_KEY = "ff_caffa_save_v1";

// Imagens são estáticas (R2) e a narração é refetchável; o save guarda só o essencial.
export interface SaveData {
  state: GameState;
  narration?: string;
}

function available(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadSave(): SaveData | null {
  if (!available()) return null;
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    return raw ? (JSON.parse(raw) as SaveData) : null;
  } catch {
    return null;
  }
}

export function writeSave(data: SaveData): void {
  if (!available()) return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    /* desiste silenciosamente */
  }
}

export function clearSave(): void {
  if (!available()) return;
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}
