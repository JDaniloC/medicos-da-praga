// Motor de áudio (singleton, client-only). Ambiente em loop + SFX one-shot + música.
// As URLs vêm do R2 via imageUrl; sem NEXT_PUBLIC_R2_BASE_URL, vira no-op silencioso.
import { imageUrl } from "@/lib/images/assets";

const STORAGE_KEY = "ff_caffa_audio_enabled";
const AMBIENT_VOL = 0.2;      /* Reduzido para dar prioridade total à narração */
const DUCK_VOL = 0.05;       /* Volume quase inaudível durante a narração */
const SFX_VOL = 0.7;
const MUSIC_VOL = 0.25;      /* Música nunca deve competir com a voz */

let enabled = true;
let ducked = false;
let ambientName: string | null = null;
let ambientEl: HTMLAudioElement | null = null;
let musicEl: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function initAudio() {
  if (typeof window === "undefined") return;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved != null) enabled = saved === "1";
}

export function isAudioEnabled() {
  return enabled;
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function setAudioEnabled(v: boolean) {
  enabled = v;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
  }
  if (!enabled) {
    ambientEl?.pause();
    musicEl?.pause();
  } else {
    if (ambientEl) ambientEl.play().catch(() => {});
    if (musicEl) musicEl.play().catch(() => {});
  }
  notify();
}

export function playSfx(name: string) {
  if (!enabled || typeof window === "undefined") return;
  const src = imageUrl(`sfx/${name}.mp3`);
  if (!src) return;
  const a = new Audio(src);
  a.volume = SFX_VOL;
  a.play().catch(() => {});
}

export function playMusic(name: string) {
  if (!enabled || typeof window === "undefined") return;
  if (musicEl) {
    musicEl.pause();
    musicEl = null;
  }
  const src = imageUrl(`music/${name}.mp3`);
  if (!src) return;
  const a = new Audio(src);
  a.volume = ducked ? DUCK_VOL : MUSIC_VOL;
  a.play().catch(() => {});
  musicEl = a;
}

// Define o ambiente em loop. `name` ex.: "amb/road"; null para silenciar.
export function setAmbient(name: string | null) {
  if (name === ambientName) return;
  ambientName = name;
  if (ambientEl) {
    ambientEl.pause();
    ambientEl = null;
  }
  if (!name || !enabled || typeof window === "undefined") return;
  const src = imageUrl(`sfx/${name}.mp3`);
  if (!src) return;
  const el = new Audio(src);
  el.loop = true;
  el.volume = ducked ? DUCK_VOL : AMBIENT_VOL;
  el.play().catch(() => {});
  ambientEl = el;
}

// Abaixa o ambiente e música enquanto a narração (TTS) toca.
export function duckAmbient(d: boolean) {
  ducked = d;
  const targetAmb = d ? DUCK_VOL : AMBIENT_VOL;
  const targetMusic = d ? DUCK_VOL : MUSIC_VOL;
  if (ambientEl) ambientEl.volume = targetAmb;
  if (musicEl) musicEl.volume = targetMusic;
}
