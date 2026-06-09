# O Cerco de Caffa — Ato 1

Aventura interativa no estilo *Fighting Fantasy*, ambientada numa Guerra dos Cem Anos ficcional
(Anglia vs. Gália, o Cerco de Caffa e a eclosão da Varíola Negra). O **Gemini** atua como narrador
(prosa imersiva); toda a lógica do jogo — cenas, traços, modificadores ocultos, rolagens de D20 e
ramificações — é controlada por uma **engine determinística**, garantindo que a história nunca saia
dos trilhos.

## Arquitetura

- **Frontend** (Next.js / React, `app/`): UI do jogo.
- **Engine genérica** (`lib/engine/` + `lib/story/`): interpretador da DSL declarativa. Não conhece
  o conteúdo — apenas executa o grafo de cenas.
- **História** (`supabase/`): fonte da verdade no Supabase (tabelas `acts`, `scenes`). O arquivo
  `supabase/seed/act1.json` dá o seed e serve de fixture de teste.
- **Proxy Gemini** (`app/api/narrate`): narração ao vivo; `GEMINI_API_KEY` só no servidor.
- **Leitura da história** (`app/api/story`): lê do Supabase com a service key (server). Sem Supabase
  configurado, cai no seed local (modo de dev).
- **Imagens**: estáticas no Cloudflare R2, referenciadas por caminho (`NEXT_PUBLIC_R2_BASE_URL`).
- **Save** (`lib/storage/`): progresso em `localStorage`.

## Como rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves (todas opcionais para um teste básico)
npm run dev                  # http://localhost:3000
```

Sem `SUPABASE_URL`, a história é lida do `supabase/seed/act1.json`. Sem `GEMINI_API_KEY`, a narração
cai em fallback (mostra o briefing). Sem `NEXT_PUBLIC_R2_BASE_URL`, as imagens mostram placeholder.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` / `npm start` — build e execução de produção
- `npm test` — testes da engine (Vitest)
- `npm run lint` — ESLint
- `npm run validate:story <arquivo>` — valida um JSON de ato (schema + integridade do grafo)
- `npm run seed:story <arquivo>` — envia um ato validado para o Supabase

## Deploy (Vercel)

1. Suba o repositório no GitHub e importe na Vercel.
2. Em **Settings → Environment Variables**, adicione `GEMINI_API_KEY`.
3. Deploy. As rotas `/api/*` rodam como funções de servidor (proxy seguro).

> GitHub Pages não é suportado: ele só serve arquivos estáticos e não consegue hospedar o proxy
> que protege a chave da API.

## Autoria de novos atos

1. Escreva o ato em prosa e converta para JSON com `docs/authoring/prosa-para-json.md`.
2. `npm run validate:story supabase/seed/act<N>.json`
3. `npm run seed:story supabase/seed/act<N>.json`
4. Gere as imagens das cenas seguindo `docs/assets/art-direction-ato1.md`.

## Estrutura

```
app/                     UI (page.tsx) + rotas /api/narrate e /api/story
components/              Componentes de UI
lib/engine/              Engine genérica (types, dice, engine)
lib/story/               DSL: schema (Zod), interpretador, grafo, validador
lib/supabase/            Cliente server-side do Supabase
lib/gemini/              Cliente e prompts de narração (servidor)
lib/client/              Helpers de fetch (história, narração)
lib/images/              Montagem de URL das imagens estáticas (R2)
scripts/                 validate-story, seed-story
supabase/                migrations + seed/act1.json (fonte de bootstrap)
docs/                    specs, plano, guias de autoria e arte
```
