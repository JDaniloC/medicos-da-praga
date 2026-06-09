# Guia: transformar um ato escrito em texto corrido em JSON do jogo

Você (criador) escreve o ato **em prosa livre** — narrativa, escolhas, testes, consequências — e
cola o **meta-prompt** abaixo num LLM (ChatGPT, Claude, Gemini) junto com o seu texto. O LLM
devolve o ato no **formato JSON da nossa DSL**, pronto para o script de seed enviar ao Supabase.

> Depois de gerar, **valide** o JSON com o nosso schema (`npm run validate:story <arquivo>`) antes
> de subir. O script recusa qualquer arquivo fora do formato.

---

## Parte 1 — Como escrever seu ato em prosa (dicas)

Para o LLM converter bem, deixe claro no seu texto:
- **Cada cena** e o que acontece nela (a narração).
- **As escolhas** de cada cena — escreva **só a ação visível** ("Fazer uma sangria"), e descreva a
  **consequência oculta separadamente** ("obs. interna: sangria piora a desidratação, mais difícil").
  A consequência NUNCA pode aparecer no texto que o jogador lê.
- **Testes de D20**: diga a dificuldade base e os modificadores ("base 12; com bisturi -3; soldado -2").
- **Ramificações**: para onde cada escolha/resultado leva.
- **Itens, marcas (flags) e estados** que a escolha concede ou liga.
- **Finais**: qual o desfecho e o título.

---

## Parte 2 — O meta-prompt (copie tudo abaixo e cole no LLM)

````text
Você é um conversor que transforma um ATO de um livro-jogo (estilo Fighting Fantasy) escrito em
prosa para um JSON estruturado que alimenta uma engine determinística. Leia o ato que vou colar ao
final e produza APENAS um objeto JSON válido (sem comentários, sem markdown, sem texto fora do JSON),
seguindo EXATAMENTE o schema e as regras abaixo.

# REGRA DE OURO (consequências ocultas)
O campo "label" de uma escolha contém SOMENTE a ação visível ao jogador. NUNCA escreva no label
bônus, penalidades, números, dificuldades ou o que a escolha vai causar. Toda a mecânica oculta vai
para "effects", "difficulty" e "next" — campos que o jogador não lê. O mesmo vale para "narration":
descreva a cena sem revelar as consequências mecânicas.

# FORMATO DE SAÍDA (um objeto "act")
{
  "act": <número inteiro do ato>,
  "title": "<título do ato>",
  "start": "<id do nó inicial>",
  "nodes": [ <nó>, <nó>, ... ]
}

# TIPOS DE NÓ
Todo nó tem: "id" (snake_case único), "kind" ("scene" | "dice" | "ending"),
"image" ("scenes/<id>.webp"), "narration" (texto-mestre da cena para o narrador, em PT-BR).
Opcional em qualquer nó: "narrationAppend": [ { "when": <cond>, "text": "<trecho extra>" } ].

## kind = "scene"
Adiciona: "choices": [ <choice> ]
  <choice> = {
    "id": "<snake_case>",
    "label": "<APENAS a ação visível>",
    "requiresTrait": "<trait>"   // opcional: escolha só aparece para este traço
    "when": <cond>,              // opcional: escolha só aparece se a condição for verdadeira
    "effects": [ <effect> ],     // opcional
    "next": <next>               // obrigatório
  }

## kind = "dice"
Adiciona:
  "reason": "<rótulo curto do teste>",
  "difficulty": { "base": <int>, "rules": [ { "when": <cond>, "set": <int> } | { "when": <cond>, "delta": <int> } ] },
  "resolve": { "onSuccess": <resolution>, "onFail": <resolution> }
  <resolution> = { "effects": [ <effect> ], "goto": <next> }
Regras de dificuldade são aplicadas EM ORDEM (use "set" para fixar um valor, "delta" para somar/subtrair).
Sucesso quando a rolagem de D20 for >= dificuldade final (limitada entre 2 e 20).

## kind = "ending"
Adiciona: "outcome": "<rótulo curto, ex.: gameover | sobrevive | imune>", "title": "<título do final>".
Nós de final não têm choices nem dice.

# COMPONENTES
<effect> (um destes; "when" é opcional em todos):
  { "setFlag": "<nomeDaFlag>", "value": true|false }
  { "grantItem": "<id_do_item>" }
  { "setTreatment": "<paciente>", "value": "<tratamento>" }
  { "setPatient": "<paciente>", "value": "sucesso"|"fracasso" }

<next> (em choice.next ou resolution.goto): ou uma string com o id do nó,
ou uma lista de regras avaliadas em ordem:
  [ { "when": <cond>, "goto": "<id>" }, ..., { "default": "<id>" } ]

<cond> (condição):
  { "trait": "<trait>" }
  { "flag": "<nomeDaFlag>", "value": true|false }
  { "hasItem": "<id_do_item>" }
  { "treatment": { "<paciente>": "<tratamento>" } }
  { "anyOf": [ <cond>, ... ] }   // verdadeiro se QUALQUER um for verdadeiro
  { "allOf": [ <cond>, ... ] }   // verdadeiro se TODOS forem verdadeiros
  { "not": <cond> }

# CONVENÇÕES
- "id" de nós e escolhas: snake_case, sem acento (ex.: "cena4_p2", "ouvir", "rama_infeccao").
- "image": sempre "scenes/<id do nó>.webp".
- Crie flags/itens/tratamentos/traços com nomes consistentes; reutilize o mesmo nome quando se referir à mesma coisa.
- Inclua um (e apenas um) nó cujo id seja igual a "start".
- Todo "next"/"goto" deve apontar para um id que exista em "nodes".
- Toda escolha deve ter um "next"; todo nó de dado deve ter "resolve.onSuccess" e "resolve.onFail".

# SAÍDA
Responda com o objeto JSON e mais nada. Garanta que é JSON válido e que todos os ids referenciados existem.

# ATO EM PROSA A CONVERTER:
<<COLE AQUI O SEU ATO ESCRITO EM TEXTO CORRIDO>>
````

---

## Parte 3 — Exemplo resolvido (mini-ato)

**Prosa de entrada:**

> Cena 1 — A bifurcação. O viajante chega a uma trilha que se divide. Ele pode seguir pela mata
> fechada à esquerda, ou pela ponte velha à direita.
> • Seguir pela mata (obs. interna: se o jogador for Druida, ele conhece o caminho — concede a flag
>   "conheceCaminho"). Leva à Cena 2.
> • Atravessar a ponte. Leva ao teste da ponte.
>
> Teste da ponte (D20) — a ponte está podre. Dificuldade base 12; se o jogador tiver a "corda", -4.
> Passou: chega são do outro lado (Cena 2). Falhou: cai no rio e morre (Game Over).

**JSON de saída:**

```json
{
  "act": 99,
  "title": "Exemplo",
  "start": "cena1",
  "nodes": [
    {
      "id": "cena1",
      "kind": "scene",
      "image": "scenes/cena1.webp",
      "narration": "O viajante chega a uma trilha que se divide: a mata fechada à esquerda, a ponte velha à direita. Pare na escolha.",
      "choices": [
        {
          "id": "mata",
          "label": "Seguir pela mata fechada à esquerda",
          "effects": [ { "setFlag": "conheceCaminho", "value": true, "when": { "trait": "druida" } } ],
          "next": "cena2"
        },
        {
          "id": "ponte",
          "label": "Atravessar a ponte velha à direita",
          "next": "ponte_dado"
        }
      ]
    },
    {
      "id": "ponte_dado",
      "kind": "dice",
      "image": "scenes/ponte_dado.webp",
      "reason": "Travessia da ponte podre",
      "narration": "As tábuas rangem sob os pés, podres pela umidade. Aguarde a rolagem de D20.",
      "difficulty": { "base": 12, "rules": [ { "when": { "hasItem": "corda" }, "delta": -4 } ] },
      "resolve": {
        "onSuccess": { "goto": "cena2" },
        "onFail": { "goto": "ending_rio" }
      }
    },
    {
      "id": "cena2",
      "kind": "scene",
      "image": "scenes/cena2.webp",
      "narration": "O viajante alcança o outro lado em segurança.",
      "choices": [ { "id": "seguir", "label": "Seguir em frente", "next": "ending_rio" } ]
    },
    {
      "id": "ending_rio",
      "kind": "ending",
      "image": "scenes/ending_rio.webp",
      "outcome": "gameover",
      "title": "Game Over — As águas do rio",
      "narration": "A madeira cede; o rio gelado o engole. Fim."
    }
  ]
}
```

---

## Parte 4 — Depois de gerar

1. Salve como `supabase/seed/act<N>.json`.
2. Rode `npm run validate:story supabase/seed/act<N>.json` (checa schema, ids órfãos, nó inicial).
3. Rode `npm run seed:story supabase/seed/act<N>.json` para enviar ao Supabase.
4. Gere as imagens das novas cenas seguindo `docs/assets/` (um arquivo `scenes/<id>.webp` por nó).
