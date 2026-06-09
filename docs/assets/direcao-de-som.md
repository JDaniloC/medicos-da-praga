# Direção de Som — *O Cerco de Caffa*

Guia dos sons da plataforma: o que tocar, quando, e o **prompt pronto** de cada um para gerar num
sintetizador de SFX por texto (recomendado: **ElevenLabs Sound Effects**; alternativas: Stable Audio,
ou bibliotecas livres como freesound.org). Mesma filosofia do `art-direction`: copie o bloco, gere,
exporte e suba pro R2.

## Estilo sonoro (vale para tudo)
- Sombrio, orgânico, **histórico do séc. XIV** — nada de sintetizadores modernos.
- Diegético/ambiente acima de música. Música só em momentos-chave (título, mortes, finais).
- Sempre **sem fala** e **sem música pop**. Ambientes em **loop perfeito (seamless)**.

## Especificações técnicas
| Item | Valor |
|---|---|
| Formato | **`.mp3`** (~128 kbps); ambientes/música podem ser estéreo, SFX curtos mono |
| Tipo | **one-shot** (UI/eventos) ou **loop seamless** (ambientes/música) |
| Duração | UI 0,5–2,5 s · eventos 1–3 s · ambientes 15–22 s (loop) · música ~20 s (loop) ou 5–6 s (sting) |
| Volume | normalizar SFX ~−16 LUFS; ambientes mais baixos (~−23 LUFS) para ficarem **abaixo da narração** |
| Nomes | `sfx/ui/<nome>.mp3`, `sfx/amb/<nome>.mp3`, `sfx/event/<nome>.mp3`, `music/<nome>.mp3` |
| Hospedagem | **R2** (igual às imagens): `NEXT_PUBLIC_R2_BASE_URL` + caminho. Subir com `npm run upload:r2` (aceita qualquer pasta) |

> Dica de mixagem no app: **abaixar (duck) o ambiente** enquanto o "🔊 Ouvir" (narração) toca.

---

## 1. UI / Sistema (one-shots)

### `sfx/ui/choice-select.mp3` — ao escolher uma opção (~0,8 s)
```
A soft quill scratch on parchment with a low paper tap, an intimate dry page whisper, medieval manuscript, no music.
```

### `sfx/ui/scene-transition.mp3` — troca de cena (~1 s)
```
A single old parchment page turning, dry paper rustle, quiet and close, medieval book, no music.
```

### `sfx/ui/dice-roll.mp3` — ao rolar o D20 (~2 s)
```
A heavy twenty-sided bone die tumbling and clattering across a worn wooden table and settling to a stop, dry close-up, no music.
```

### `sfx/ui/dice-success.mp3` — resultado de sucesso (~2 s)
```
A short sober resolve: a low warm string swell with a single soft bell, hopeful but grave, medieval, no melody, no music bed.
```

### `sfx/ui/dice-failure.mp3` — resultado de fracasso (~2 s)
```
A grim low drum thud with a dissonant cello scrape and a fading breath, foreboding, medieval, no music.
```

### `sfx/ui/item-get.mp3` — item adicionado ao inventário (~1 s)
```
Picking up an object: a small leather pouch shift and a faint single metallic clink, close and dry, medieval, no music.
```

### `sfx/ui/trait-select.mp3` — ao confirmar o traço inicial (~2,5 s)
```
A solemn fateful low brass swell with a soft bell, a moment of destiny, medieval, grave, no music bed.
```

### `sfx/ui/game-over.mp3` — morte / Game Over (~4 s)
```
A single deep funeral bell toll fading into a cold dark drone, distant crows, mournful, medieval, no music.
```

### `sfx/ui/ending-survive.mp3` — final de sobrevivência (~5 s)
```
A weary solemn resolve: slow warm strings settling into a quiet grave major chord, dawn after horror, medieval, restrained.
```

---

## 2. Ambientes (loops seamless, 15–22 s) — fundo por tipo de cena

### `sfx/amb/road.mp3` — a estrada
```
Seamless loop. A muddy country road in a blighted spring: gusting wind, distant cawing crows, the slow creak of a wooden cart and tired hooves, bleak and open. No music, no voices.
```

### `sfx/amb/camp.mp3` — acampamento de cerco
```
Seamless loop. A grim medieval siege camp: distant muffled battle and war drums, crackling pyres, low murmuring soldiers, flapping ragged banners, occasional clank of armour. No music, no intelligible voices.
```

### `sfx/amb/hospital.mp3` — tendas médicas
```
Seamless loop. A 14th-century field-hospital tent: faint pained moans and wet coughing, slow dripping, buzzing flies, low murmurs, oppressive and close. No music, no intelligible voices.
```

### `sfx/amb/night-revolt.mp3` — revolta noturna
```
Seamless loop. A night-time camp mutiny: distant angry shouting, crackling fire, scuffling and clashing metal in the dark, panic and chaos. No music.
```

### `sfx/amb/plague-march.mp3` — marcha da peste
```
Seamless loop. A bleak winter road of sick soldiers trudging home: cold wind, hacking coughs, dragging footsteps, a lone distant crow, despair. No music.
```

### `sfx/amb/siege-fall.mp3` — a queda de Caffa
```
Seamless loop. An apocalyptic siege: heavy trebuchets creaking and launching, distant stone impacts and collapsing walls, wheeling crows, smoke and ruin. No music.
```

---

## 3. Stingers de evento (one-shots, 1–3 s)

### `sfx/event/surgery.mp3` — cirurgia/tratamento (cena 4)
```
A tense visceral field-surgery moment: a blade cutting flesh, a stifled gasp, a small metal instrument set down, wet and close, grim, no music.
```

### `sfx/event/combat.mp3` — combate (revolta)
```
A brutal short clash of a knife against a short sword in the dark: grunts, metal scrape, a heavy body impact, no music.
```

### `sfx/event/catapult.mp3` — lançamento (ramificação A)
```
A massive trebuchet launching: creaking timber and a deep whoosh, then a distant heavy wet impact, grim, no music.
```

---

## 4. Música (opcional, momentos-chave)

### `music/title-theme.mp3` — tela inicial (loop ~20 s)
```
A dark medieval main theme, loopable: slow low strings and a distant mournful solo female voice, sparse, epic and grave, 14th-century, no percussion.
```

### `music/death-theme.mp3` — finais de morte (~6 s)
```
A short mournful medieval requiem sting: low choir and a single bell, tragic and final, no percussion.
```

### `music/triumph-theme.mp3` — finais de sobrevivência (~6 s)
```
A solemn hard-won victory cue: slow strings rising to a grave major resolve, weary hope, medieval, restrained.
```

---

## 5. Mapeamento para o Ato 1 (quando tocar)

**Ambiente por nó** (loop de fundo):
| Ambiente | Nós |
|---|---|
| `amb/road` | `cena1` |
| `amb/camp` | `cena2`, `cena3`, `cena5`, `cena5_duelo` |
| `amb/hospital` | `cena4_punicao`, `cena4_investigacao`, `cena4_p1`/`_dado`, `cena4_p2`/`_dado`, `cena4_p3`/`_dado` |
| `amb/siege-fall` | `rama_intro` |
| `amb/plague-march` | `rama_infeccao`, `rama_sobrevivencia` |
| `amb/night-revolt` | `ramb_intro`, `ramb_combate` |
| (silêncio/suave) | finais |

**Gatilhos de UI/evento** (one-shots):
- escolher opção → `ui/choice-select`; entrar em nova cena → `ui/scene-transition`
- rolar D20 → `ui/dice-roll`; resultado → `ui/dice-success` ou `ui/dice-failure`
- ganhar item → `ui/item-get`; escolher traço → `ui/trait-select`
- nó de dado de cirurgia (`cena4_*_dado`) → `event/surgery`; `ramb_combate` → `event/combat`; `rama_intro` → `event/catapult`
- final `gameover` → `ui/game-over` + `music/death-theme`; finais de vida → `ui/ending-survive` + `music/triumph-theme`

---

## 6. Checklist
- [ ] 9 SFX de UI (`sfx/ui/`)
- [ ] 6 ambientes em loop (`sfx/amb/`)
- [ ] 3 stingers de evento (`sfx/event/`)
- [ ] 3 faixas de música (`music/`) — opcional
- [ ] Tudo `.mp3`, ambientes em **loop seamless**, normalizado
- [ ] Upload pro R2 (`npm run upload:r2`) preservando as pastas

> **Wiring (próximo passo, quando quiser):** um pequeno motor de áudio no app — `ambient` opcional por nó (toca o loop em fundo, com fade/duck sob a narração) + `sfx(nome)` disparado nos eventos de UI. Posso implementar com um `lib/audio` + `<audio>`/WebAudio e um controle de mudo/volume.
