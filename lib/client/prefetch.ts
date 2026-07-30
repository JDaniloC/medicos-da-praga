// lib/client/prefetch.ts
// Ponto de composição entre a engine (pura) e o cache de narração (rede): o único
// lugar autorizado a conhecer os dois. Nunca lança — falhar aqui só significa que o
// jogador vai esperar normalmente se chegar numa cena que não foi pré-gerada.
import type { Engine } from "../engine/engine";
import type { GameState } from "../engine/types";
import { nextNarrationInputs } from "../engine/lookahead";
import { primeNarration } from "./narration-cache";

// Pré-gera os futuros imediatos de um estado. `nextNarrationInputs` não é livre de
// exceções: história autorada sem regra de `next` que resolva (possível hoje via
// /builder, ver NextRuleSchema) faz `chooseOption` lançar. Um estado especulativo
// ruim não pode derrubar o fluxo do jogo nem impedir a pré-geração dos irmãos válidos.
export function primeNextNarrations(engine: Engine, state: GameState): void {
  let proximas: ReturnType<typeof nextNarrationInputs>;
  try {
    proximas = nextNarrationInputs(engine, state);
  } catch {
    return;
  }

  for (const proxima of proximas) {
    try {
      primeNarration(proxima);
    } catch {
      // Um irmão ruim não pode impedir a pré-geração dos demais.
    }
  }
}
