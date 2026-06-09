# Guia: gerar os prompts de imagem de qualquer ato

O `art-direction-ato1.md` é o resultado **concreto** deste guia para o Ato 1. Aqui está a **lógica
reutilizável**: dado o JSON de um ato (no formato da nossa DSL — veja `docs/authoring/prosa-para-json.md`),
um LLM gera a **lista de prompts de imagem** de todas as cenas e retratos, no **mesmo estilo visual**,
com os nomes de arquivo corretos.

Fluxo: ato em prosa → (prosa-para-json) → `act<N>.json` → (este guia) → prompts de imagem → gere e
suba para o R2 (`npm run images:webp` + `npm run upload:r2`).

---

## Estilo único (vale para todos os atos)

**Fighting Fantasy clássico** — pen-and-ink preto e branco (estilo Russ Nicholson). Sufixo de estilo
fixo, colado no fim de **todo** prompt:

> `Black-and-white pen-and-ink gamebook illustration in the classic Fighting Fantasy style of Russ Nicholson, dense crosshatching and stippling, stark high-contrast pure blacks and whites, no colour, no grey wash, gritty macabre 14th-century medieval atmosphere, highly detailed ink linework, no text, no border, no signature, no watermark.`

### Convenções técnicas
- **Cenas/dados/finais:** proporção **16:9**, arquivo `scenes/<id-do-nó>.webp`.
- **Retratos:** proporção **3:4**, arquivo igual ao campo `portrait` do traço (ex.: `portraits/soldado.webp`).
- Exportar em **`.webp`**; nomes **idênticos** aos do JSON (o app monta a URL a partir deles).
- **UI/decoração** (`ui/…`: ícones de item, selos de traço, d20, moldura, banner, divisórias) é
  **global** — gere uma vez (seção "Elementos de UI" do `art-direction-ato1.md`) e **reutilize entre atos**.
  Só gere novos `ui/icons/<item>.webp` e `ui/traits/<traço>.webp` se o ato introduzir itens/traços novos.
- Midjourney: acrescente `--ar 16:9` (cenas) ou `--ar 3:4` (retratos); outros geradores leem a proporção em palavras.

---

## O meta-prompt (copie tudo e cole no LLM, com o JSON do ato no fim)

````text
Você converte um ATO de um livro-jogo (no formato JSON da DSL do jogo) em uma LISTA DE PROMPTS DE
IMAGEM — um por nó de cena e um por traço — todos no MESMO estilo visual. Leia o JSON ao final e
produza APENAS a lista no formato especificado (sem comentários fora dela).

# ESTILO (sufixo fixo, idêntico em todo prompt)
Termine CADA prompt exatamente com:
"Black-and-white pen-and-ink gamebook illustration in the classic Fighting Fantasy style of Russ Nicholson, dense crosshatching and stippling, stark high-contrast pure blacks and whites, no colour, no grey wash, gritty macabre 14th-century medieval atmosphere, highly detailed ink linework, no text, no border, no signature, no watermark."

# REGRA DE CONSISTÊNCIA (bíblia de personagens)
Antes de gerar, identifique os personagens recorrentes (o protagonista e os NPCs citados em
"worldContext" e nas "narration") e defina para cada um um DESCRITOR FIXO curto (idade, figurino,
traços). Reutilize o MESMO descritor toda vez que o personagem aparecer, para manter o rosto/figurino
consistentes entre as cenas. Use "worldContext" para acertar época, lugar e vestimentas.

# O QUE GERAR
1) Para CADA objeto em "nodes":
   - Arquivo: scenes/<id>.webp
   - Prompt (em inglês, uma única linha) começando com "Wide 16:9 widescreen landscape composition."
     descrevendo o AMBIENTE, os PERSONAGENS presentes e a AÇÃO, com base em "narration" (e, se houver,
     incorpore o contexto de "narrationAppend"). NÃO inclua texto, UI, números, menus nem mecânica.
   - Termine com o sufixo de estilo.

2) Para CADA objeto em "traits":
   - Arquivo: o valor do campo "portrait" do traço (ex.: portraits/soldado.webp)
   - Prompt (em inglês, uma única linha) começando com
     "Vertical 3:4 portrait composition. Half-body portrait of a young 14th-century ..." derivado de
     "descricao" e do papel do traço, fundo neutro escuro hachurado.
   - Termine com o sufixo de estilo.

# FORMATO DE SAÍDA (markdown)
Para cada arquivo, exatamente:
### caminho/do/arquivo.webp
```
PROMPT COMPLETO EM UMA LINHA TERMINANDO NO SUFIXO DE ESTILO
```

# ATO (JSON) A CONVERTER:
<<COLE AQUI O JSON DO ATO (act<N>.json)>>
````

---

## Exemplo de saída (trecho)

Entrada (um nó):
```json
{ "id": "ponte_dado", "kind": "dice", "image": "scenes/ponte_dado.webp",
  "narration": "As tábuas podres da ponte rangem sobre o rio gelado..." }
```

Saída esperada:
```
### scenes/ponte_dado.webp
```
Wide 16:9 widescreen landscape composition. A young traveller stepping onto a rotten wooden bridge over a freezing river, planks cracking underfoot, mist rising, bleak gorge below. Black-and-white pen-and-ink gamebook illustration in the classic Fighting Fantasy style of Russ Nicholson, dense crosshatching and stippling, stark high-contrast pure blacks and whites, no colour, no grey wash, gritty macabre 14th-century medieval atmosphere, highly detailed ink linework, no text, no border, no signature, no watermark.
```
```

---

## Depois de gerar
1. Gere as imagens no seu gerador, exporte como PNG/JPG na pasta `images/` preservando as subpastas
   (`scenes/`, `portraits/`).
2. `npm run images:webp` — converte tudo para `.webp` (`--max=1600` para reduzir o peso, opcional).
3. `npm run upload:r2` — sobe para o bucket R2.
4. Confira no jogo (as cenas usam `scenes/<id>.webp`; os retratos, o `portrait` do traço).
