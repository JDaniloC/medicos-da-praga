// Síntese de voz via Edge TTS (vozes neurais da Microsoft, grátis, sem API key).
// Usado só no servidor (rota /api/tts). Endpoint não-oficial da Microsoft.
import { EdgeTTS } from "@andresaya/edge-tts";

// Voz padrão pt-BR (masculina, tom grave combina com o narrador). Override por env TTS_VOICE.
// Alternativas: "pt-BR-FranciscaNeural" (fem.), "pt-BR-ThalitaNeural" (fem.).
export const DEFAULT_VOICE = process.env.TTS_VOICE ?? "pt-BR-AntonioNeural";

// Retorna um MP3 (Buffer) com a narração lida em voz alta.
export async function synthesizeSpeech(text: string, voice = DEFAULT_VOICE): Promise<Buffer> {
  const tts = new EdgeTTS();
  await tts.synthesize(text, voice, { rate: "-5%", pitch: "-2Hz", volume: "0%" });
  return tts.toBuffer();
}
