"use client";

import { useEffect, useState } from "react";
import { initAudio, isAudioEnabled, setAudioEnabled, subscribe } from "@/lib/audio/engine";

// Botão de mudo no header. Persiste a preferência no localStorage.
export function AudioToggle() {
  const [on, setOn] = useState(true);

  useEffect(() => {
    initAudio();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(isAudioEnabled());
    return subscribe(() => setOn(isAudioEnabled()));
  }, []);

  return (
    <button
      onClick={() => setAudioEnabled(!on)}
      aria-label={on ? "Desativar som" : "Ativar som"}
      title={on ? "Som ligado" : "Som desligado"}
      className="rounded border border-edge px-2 py-1 text-sm text-ink-soft transition hover:border-accent hover:text-ink"
    >
      {on ? "🔊" : "🔇"}
    </button>
  );
}
