"use client";

import { useEffect, useRef, useState } from "react";
import { fetchSpeechUrl } from "@/lib/client/tts";
import { duckAmbient } from "@/lib/audio/engine";

type Status = "idle" | "loading" | "playing";

// Botão "Ouvir": busca o áudio da narração (Edge TTS via /api/tts) e toca.
export function SpeakButton({ text }: { text: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  // Interrompe ao desmontar.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      duckAmbient(false);
    };
  }, []);

  // Ao trocar de cena (texto novo), interrompe a fala anterior.
  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    duckAmbient(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("idle");
  }, [text]);

  async function toggle() {
    if (status === "loading") return;
    if (status === "playing") {
      audioRef.current?.pause();
      duckAmbient(false);
      setStatus("idle");
      return;
    }
    try {
      setStatus("loading");
      const url = await fetchSpeechUrl(text);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        duckAmbient(false);
        setStatus("idle");
      };
      audio.onerror = () => {
        duckAmbient(false);
        setStatus("idle");
      };
      await audio.play();
      duckAmbient(true);
      setStatus("playing");
    } catch {
      duckAmbient(false);
      setStatus("idle");
    }
  }

  if (!text) return null;

  const label = status === "loading" ? "⏳ Gerando…" : status === "playing" ? "⏹ Parar" : "🔊 Ouvir";

  return (
    <button
      onClick={toggle}
      disabled={status === "loading"}
      aria-label="Ouvir narração"
      className="inline-flex items-center gap-1.5 rounded-md border border-edge bg-panel px-3 py-1 text-xs font-semibold text-accent transition hover:border-accent hover:bg-panel-strong disabled:opacity-60"
    >
      {label}
    </button>
  );
}
