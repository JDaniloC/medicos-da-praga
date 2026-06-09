"use client";

import { useEffect, useState } from "react";

// Lê a narração em voz alta usando a Web Speech API do navegador (grátis, voz pt-BR).
// Divide o texto em frases para contornar o corte de falas longas do Chrome.
export function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  // Interrompe a fala ao desmontar.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  // Ao trocar de cena (texto novo), interrompe a fala anterior.
  useEffect(() => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSpeaking(false);
  }, [text]);

  function pickPtVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | undefined {
    const voices = synth.getVoices();
    return (
      voices.find((v) => v.lang?.toLowerCase() === "pt-br") ??
      voices.find((v) => v.lang?.toLowerCase().startsWith("pt"))
    );
  }

  function toggle() {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) return;
    if (synth.speaking || synth.pending) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const chunks = (text.match(/[^.!?]+[.!?]*\s*/g) ?? [text])
      .map((c) => c.trim())
      .filter(Boolean);
    const voice = pickPtVoice(synth);
    chunks.forEach((chunk, i) => {
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = "pt-BR";
      if (voice) u.voice = voice;
      u.rate = 0.95;
      u.pitch = 1;
      if (i === chunks.length - 1) u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      synth.speak(u);
    });
    setSpeaking(true);
  }

  if (!text) return null;

  return (
    <button
      onClick={toggle}
      aria-label={speaking ? "Parar narração" : "Ouvir narração"}
      className="inline-flex items-center gap-1.5 rounded-md border border-edge bg-panel px-3 py-1 text-xs font-semibold text-accent transition hover:border-accent hover:bg-panel-strong"
    >
      {speaking ? "⏹ Parar" : "🔊 Ouvir"}
    </button>
  );
}
