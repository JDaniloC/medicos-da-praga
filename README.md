# O Cerco de Caffa — Ato 1

Aventura interativa no estilo *Fighting Fantasy*, ambientada numa Guerra dos Cem Anos ficcional
(Anglia vs. Gália, o Cerco de Caffa e a eclosão da Varíola Negra). O **Gemini** atua como narrador
(prosa imersiva) e gerador de imagens; toda a lógica do jogo — cenas, traços, modificadores ocultos,
rolagens de D20 e ramificações — é controlada por uma **engine determinística**, garantindo que a
história nunca saia dos trilhos.

## Arquitetura

- **Frontend** (Next.js / React, `app/`): UI do jogo (narração, imagem da cena, retrato, escolhas,
  dado, inventário).
- **Engine** (`lib/engine/`): TypeScript puro e testável. É a fonte da verdade do fluxo do jogo.
- **Proxy Gemini** (`app/api/narrate`, `app/api/image`): rotas de servidor que chamam o Gemini. A
  chave `GEMINI_API_KEY` fica **só no servidor**, nunca no navegador.
- **Save** (`lib/storage/`): progresso salvo em `localStorage` (fechar e continuar).

Modelos usados: `gemini-2.5-flash` (texto) e `gemini-2.5-flash-image` / "Nano Banana" (imagem).

## Como rodar localmente

```bash
npm install
cp .env.example .env.local   # e preencha GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

Sem `GEMINI_API_KEY` o jogo ainda roda em **modo de fallback**: a narração exibe os briefings das
cenas e as imagens ficam vazias — útil para testar a lógica.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` / `npm start` — build e execução de produção
- `npm test` — testes da engine (Vitest)
- `npm run lint` — ESLint

## Deploy (Vercel)

1. Suba o repositório no GitHub e importe na Vercel.
2. Em **Settings → Environment Variables**, adicione `GEMINI_API_KEY`.
3. Deploy. As rotas `/api/*` rodam como funções de servidor (proxy seguro).

> GitHub Pages não é suportado: ele só serve arquivos estáticos e não consegue hospedar o proxy
> que protege a chave da API.

## Estrutura

```
app/                     UI (page.tsx) + rotas de API (proxy Gemini)
components/              Componentes de UI (cena, dado, escolhas, retrato...)
lib/engine/              Engine determinística (types, traits, dice, scenes/act1, endings)
lib/gemini/              Cliente e prompts do Gemini (servidor)
lib/storage/             Save/carga em localStorage
lib/client/              Helpers de fetch para as rotas de API
```

## Estendendo a campanha

O grafo de cenas é orientado a dados em `lib/engine/scenes/act1.ts`. Para novos atos, crie
`act2.ts` etc. e registre-os na engine, reutilizando o mesmo motor de estado, D20, prompts e camada
de imagem.
