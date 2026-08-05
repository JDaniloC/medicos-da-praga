// components/GameOver.tsx
"use client";

import { useState } from "react";
import type { DebriefingItem } from "@/lib/story/schema";
import { SpeakButton } from "./SpeakButton";
import { imageUrl } from "@/lib/images/assets";

const DEFAULT_DEBRIEFING: (DebriefingItem & {
  date?: string;
  labelLeft?: string;
  valueLeft?: string;
  labelRight?: string;
  valueRight?: string;
})[] = [
  {
    id: "guerra_cem_anos",
    icon: "⚔️",
    title: "A Guerra dos Cem Anos",
    subtitle: "Guerra Anglia vs. Gália",
    date: "1337",
    image: "debriefing/war.png",
    content:
      "O conflito geopolítico do jogo entre Anglia e Gália foi inspirado na longa e devastadora **Guerra dos Cem Anos (1337–1453)** travada entre Inglaterra e França, marcada por cercos sangrentos e instabilidade social.",
    labelLeft: "🛡️ O Contexto Histórico",
    valueLeft: "Duas grandes potências disputando terras, levando à fome, cercos e caos social que prepararam o terreno para pragas.",
    labelRight: "🧬 O Legado Real",
    valueRight: "Estabeleceu as bases da identidade nacional e as fronteiras geopolíticas modernas de Inglaterra e França."
  },
  {
    id: "cerco_caffa",
    icon: "🏰",
    title: "O Cerco de Caffa e a Guerra Biológica",
    subtitle: "Primeiro ataque biológico registrado",
    date: "1346",
    image: "debriefing/caffa.png",
    content:
      "O momento em que o Canato propõe lançar corpos infectados sobre as muralhas é um fato histórico real! O **Cerco de Caffa (1346)** envolveu as forças mongóis arremessando cadáveres com a Peste Negra para dentro da cidade sitiada.",
    labelLeft: "🛡️ Mito ou Fato",
    valueLeft: "Mongóis sabiam que causava contágio, mas acreditavam que o odor fétido/miasma dos corpos matava os inimigos.",
    labelRight: "🧬 O Legado Real",
    valueRight: "Considerado um dos primeiros registros de guerra biológica e o vetor que espalhou a Peste Negra na Europa."
  },
  {
    id: "medicos_peste",
    icon: "🎭",
    title: "Os Médicos da Peste",
    subtitle: "Traje de Proteção Histórico",
    date: "1619",
    image: "debriefing/doctor.png",
    content:
      "O traje característico (com o manto de couro grosso e a famosa máscara em formato de bico de pássaro) começou a ser desenhado na Europa medieval/renascentista. O bico era preenchido com **ervas aromáticas, cânfora e vinagre**.",
    labelLeft: "🛡️ Mito da Época",
    valueLeft: "Acreditavam que os odores doces das ervas no bico da máscara neutralizavam o 'ar infectado' (miasma) da peste.",
    labelRight: "🧬 O Legado Real",
    valueRight: "O traje serviu como um protótipo primitivo dos modernos respiradores (N95) e roupas de isolamento biológico."
  },
  {
    id: "humores_miasma",
    icon: "🧪",
    title: "A Teoria dos Humores e Miasmas",
    subtitle: "Os Erros da Ciência Antiga",
    date: "Antiguidade",
    image: "debriefing/miasma.png",
    content:
      "Durante séculos, a humanidade acreditou que as doenças surgiam do desequilíbrio entre os fluidos corporais (**Teoria dos Humores**) ou pelo **Miasma** — um ar infectado e pútrido oriundo de matéria em decomposição.",
    labelLeft: "🛡️ O Erro Científico",
    valueLeft: "Acreditava-se que reestabelecer os quatro humores (sangue, fleuma, bile amarela/negra) curava infecções.",
    labelRight: "🧬 O Legado Real",
    valueRight: "Hoje sabemos que a Varíola e a Peste Negra são causadas por vírus e bactérias específicas (como a Yersinia pestis)."
  },
  {
    id: "lado_positivo_miasma",
    icon: "🧼",
    title: "O Lado Positivo do Miasma",
    subtitle: "A Revolução da Higiene Pública",
    date: "Séc. XIX",
    image: "debriefing/sanitation.png",
    content:
      "Apesar de a Teoria do Miasma estar cientificamente errada, ela teve um impacto positivo gigante! Ao acreditarem que o 'ar ruim' causava as pragas, médicos e governantes passaram a **incentivar a limpeza urbana e de hospitais**.",
    labelLeft: "🛡️ Crença Inicial",
    valueLeft: "Limpar as ruas, drenar pântanos e ventilar latrinas servia para afastar os odores ruins geradores de pragas.",
    labelRight: "🧬 O Legado Real",
    valueRight: "Essas práticas de saneamento básico pioneiras limparam cidades e abriram caminho para a medicina sanitária moderna."
  }
];

function formatHighlight(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={i}
          className="font-bold text-accent bg-amber-500/10 px-1 py-0.5 rounded font-sans"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// -----------------------------------------------------------------------------
// COMPONENTE 1: GameOver (Fim de Jogo / Vitória da Narrativa)
// -----------------------------------------------------------------------------
export function GameOver({
  title,
  outcome,
  onShowDebriefing,
  onRestart,
}: {
  title: string;
  outcome: string;
  onShowDebriefing: () => void;
  onRestart: () => void;
}) {
  const isDeath = outcome === "gameover";

  return (
    <div className="fade-in mt-8 rounded-xl border-2 border-edge bg-panel p-6 sm:p-8 text-center shadow-md">
      <div className="inline-block rounded-full bg-panel-strong px-4 py-1.5 border border-edge mb-3 shadow-sm">
        <p
          className={`text-xs font-extrabold uppercase tracking-[0.25em] ${
            isDeath ? "text-blood" : "text-success"
          }`}
        >
          {isDeath ? "💀 Fim de Jogo" : "🏆 Fim do Ato 1"}
        </p>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold font-serif text-accent mb-6 leading-tight">
        {title}
      </h2>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onShowDebriefing}
          className="w-full sm:w-auto rounded-lg border-2 border-accent bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition duration-200"
        >
          📜 Ver Debriefing Histórico & Créditos
        </button>

        <button
          onClick={onRestart}
          className="w-full sm:w-auto rounded-lg border border-edge bg-panel px-6 py-3.5 text-sm font-semibold text-accent hover:bg-panel-strong transition duration-200"
        >
          🔄 Recomeçar a Campanha
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// COMPONENTE 2: DebriefingScreen (Módulo de Encerramento)
// -----------------------------------------------------------------------------
export function DebriefingScreen({
  debriefing,
  onRestart,
  onBack,
}: {
  title: string;
  debriefing?: DebriefingItem[];
  onRestart: () => void;
  onBack: () => void;
}) {
  const items = debriefing && debriefing.length > 0 ? debriefing : DEFAULT_DEBRIEFING;

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");

  const currentItem = items[activeIndex] || items[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="fade-in space-y-8 rounded-2xl border border-edge/85 bg-panel p-6 sm:p-8 md:p-12 shadow-xl text-ink max-w-5xl mx-auto">
      {/* Barra de Ação Superior */}
      <div className="flex items-center justify-between border-b border-edge/60 pb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-accent transition duration-150"
        >
          ← Voltar para a Conclusão
        </button>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-ink-soft opacity-60">
          <span>Capítulo 1</span>
          <span>◆</span>
          <span>Notas de Produção</span>
        </div>
      </div>

      {/* Cabeçalho Principal (Estilo Editorial Premium) */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif text-accent tracking-wide uppercase">
          Fim da Demonstração do Ato 1
        </h3>
        <p className="text-sm text-ink-soft italic font-serif max-w-xl mx-auto">
          Um mergulho no contexto real que inspirou os reinos, perigos e a medicina científica da nossa crônica.
        </p>
        <div className="flex items-center justify-center gap-2 pt-3">
          <div className="h-[1px] w-20 bg-edge/80" />
          <span className="text-xs text-amber-600 font-serif">❦</span>
          <div className="h-[1px] w-20 bg-edge/80" />
        </div>
      </div>

      {/* Nota do Desenvolvedor */}
      <div className="relative overflow-hidden rounded-xl border-l-4 border-amber-600 bg-amber-500/[0.04] p-6 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-amber-800 mb-2.5 text-xs uppercase tracking-wider">
          <span className="text-base">📍</span> Nota do Desenvolvedor
        </div>
        <p className="text-sm leading-relaxed text-ink/90 font-serif italic">
          Esta é uma versão de demonstração (Demo) desenvolvida para apresentação escolar, fazendo parte do projeto de pesquisa de <strong className="font-semibold text-accent">Mestrado</strong>. O projeto foi idealizado e desenvolvido em colaboração com a empresa de um amigo e parceiro de tecnologia.
        </p>
      </div>

      <hr className="border-edge/60" />

      {/* Seção Central: Debriefing Histórico */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-edge/60 pb-3">
          <div>
            <h4 className="text-lg sm:text-xl font-bold text-accent font-serif flex items-center gap-2">
              <span>📚</span> Debriefing Histórico e Científico
            </h4>
          </div>

          {/* Seletor de visualização */}
          <div className="flex items-center gap-1 rounded-lg border border-edge bg-panel-strong p-1 text-xs">
            <button
              onClick={() => setViewMode("carousel")}
              className={`rounded px-3 py-1.5 font-semibold transition ${
                viewMode === "carousel"
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              🖼️ Carrossel
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded px-3 py-1.5 font-semibold transition ${
                viewMode === "grid"
                  ? "bg-accent text-white shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              📋 Todos ({items.length})
            </button>
          </div>
        </div>

        {/* MODO CARROSSEL (Linha do Tempo + Layout Amplo) */}
        {viewMode === "carousel" ? (
          <div className="space-y-8">
            {/* LINHA DO TEMPO INTERATIVA (Substitui as abas simples) */}
            <div className="relative pt-4 pb-8 border-b border-edge/40">
              {/* Linha do trilho horizontal */}
              <div className="absolute top-[34px] left-[5%] right-[5%] h-[2px] bg-edge/70 z-0" />
              
              <div className="relative flex justify-between items-center w-full z-10 px-2 sm:px-4">
                {items.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <div key={item.id || idx} className="flex flex-col items-center relative">
                      <button
                        onClick={() => setActiveIndex(idx)}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm transition-all duration-200 z-20 bg-panel hover:scale-110 shadow-sm ${
                          isActive
                            ? "border-accent bg-accent text-white ring-4 ring-accent/10"
                            : "border-edge text-ink-soft hover:border-accent hover:text-ink"
                        }`}
                        aria-label={`Marco ${item.date || idx + 1}: ${item.title}`}
                      >
                        <span className="text-base select-none">{item.icon ?? "📜"}</span>
                      </button>
                      
                      {/* Rótulo da data/milestone abaixo do círculo */}
                      <span className={`absolute top-12 text-[10px] sm:text-xs font-mono font-bold tracking-wider whitespace-nowrap transition-colors duration-150 ${
                        isActive ? "text-accent font-extrabold" : "text-ink-soft/70"
                      }`}>
                        {item.date || `Etapa ${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Split layout: Imagem na esquerda, texto na direita */}
            <div className="grid md:grid-cols-[1fr_1.1fr] gap-8 rounded-xl border border-edge bg-panel p-6 shadow-sm items-start">
              {/* Moldura da imagem (Quadrada e Snug Fit) */}
              <div className="rounded-lg border border-edge bg-slate-950/5 p-0 flex items-center justify-center aspect-square w-full max-w-[360px] md:max-w-none mx-auto overflow-hidden shadow-inner">
                {currentItem.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl(currentItem.image)}
                    alt={currentItem.title}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-5xl">{currentItem.icon ?? "📜"}</div>
                )}
              </div>

              {/* Informações Textuais, Audiodescrição e Mito vs Realidade */}
              <div className="flex flex-col justify-between h-full space-y-4">
                <div className="space-y-4">
                  {/* Cabeçalho do Cartão com Botão Ouvir / TTS */}
                  <div className="flex items-start justify-between gap-4 border-b border-edge/45 pb-3">
                    <div className="space-y-1">
                      <span className="inline-block rounded bg-amber-100 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-900 border border-amber-300/40">
                        {currentItem.subtitle ?? "Contexto Histórico"}
                      </span>
                      <h5 className="text-xl sm:text-2xl font-bold font-serif text-accent leading-tight flex items-center gap-2">
                        <span>{currentItem.title}</span>
                      </h5>
                    </div>
                    
                    {/* Botão de Áudio (Audiodescrição - DNA SimpleRead) */}
                    <div className="shrink-0 pt-1">
                      <SpeakButton text={`${currentItem.title}. ${currentItem.content.replace(/\*\*/g, "")}`} />
                    </div>
                  </div>

                  {/* Conteúdo Textual com Destaques Dinâmicos (Negritos) */}
                  <p className="text-base sm:text-lg leading-relaxed text-ink font-serif">
                    {formatHighlight(currentItem.content)}
                  </p>

                  {/* ESTRUTURA COMPARATIVA (Mito/Histórico vs Realidade/Legado) */}
                  {currentItem.labelLeft && currentItem.valueLeft && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-edge/50">
                      {/* Coluna da Esquerda (Mito ou Contexto) */}
                      <div className="rounded-lg border border-edge/60 bg-panel-strong p-4 space-y-1 shadow-sm">
                        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block font-sans">
                          {currentItem.labelLeft}
                        </span>
                        <p className="text-xs sm:text-sm leading-relaxed text-ink font-serif">
                          {currentItem.valueLeft}
                        </p>
                      </div>

                      {/* Coluna da Direita (Realidade Científica ou Legado) */}
                      <div className="rounded-lg border border-indigo-200/50 bg-indigo-500/[0.02] p-4 space-y-1 shadow-sm">
                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block font-sans">
                          {currentItem.labelRight || "🧬 Realidade / Legado"}
                        </span>
                        <p className="text-xs sm:text-sm leading-relaxed text-ink font-serif">
                          {currentItem.valueRight}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controles do Carrossel */}
                <div className="flex items-center justify-between pt-4 border-t border-edge/40">
                  <button
                    onClick={handlePrev}
                    className="rounded-md border border-edge bg-panel px-4 py-2 text-xs font-bold text-accent hover:bg-panel-strong transition"
                  >
                    ← Anterior
                  </button>

                  <div className="flex items-center gap-1.5">
                    {items.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`h-2.5 rounded-full transition-all ${
                          idx === activeIndex
                            ? "w-6 bg-accent"
                            : "w-2 bg-edge hover:bg-ink-soft"
                        }`}
                        aria-label={`Ir para item ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    className="rounded-md border border-accent bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODO GRID (Todos os itens organizados) */
          <div className="grid gap-6 sm:grid-cols-2">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-xl border border-edge bg-panel p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                {item.image && (
                  <div className="w-full rounded border border-edge bg-slate-950/5 p-0 flex items-center justify-center aspect-square max-h-[300px] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl(item.image)}
                      alt={item.title}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300/40">
                      {item.subtitle}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-ink-soft">
                      {item.date}
                    </span>
                  </div>
                  
                  <h5 className="font-bold font-serif text-accent text-base sm:text-lg flex items-center gap-2 mt-1">
                    <span>{item.icon ?? "📜"}</span>
                    <span>{item.title}</span>
                  </h5>
                  
                  <p className="text-sm leading-relaxed text-ink font-serif">
                    {formatHighlight(item.content)}
                  </p>

                  {/* Comparativo no Grid (Compacto) */}
                  {item.labelLeft && item.valueLeft && (
                    <div className="grid grid-cols-1 gap-2 pt-3 border-t border-edge/30 mt-3">
                      <div className="text-xs font-serif bg-panel-strong p-2 rounded">
                        <strong className="text-amber-950 text-[10px] block font-sans uppercase">{item.labelLeft}:</strong>
                        {item.valueLeft}
                      </div>
                      <div className="text-xs font-serif bg-indigo-50/45 p-2 rounded border border-indigo-100/50">
                        <strong className="text-indigo-950 text-[10px] block font-sans uppercase">{item.labelRight}:</strong>
                        {item.valueRight}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rodapé Dinâmico: Agradecimentos e Tecnologia (Lado a Lado) */}
      <div className="grid md:grid-cols-2 gap-6 border-t border-edge/60 pt-8">
        {/* Bloco A: Agradecimentos */}
        <div className="rounded-xl border border-edge bg-panel-strong p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <h5 className="text-base font-bold font-serif text-accent flex items-center gap-2 border-b border-edge/40 pb-2">
              <span>🎓</span> Agradecimentos
            </h5>
            <p className="text-sm sm:text-base leading-relaxed text-ink/90 font-serif">
              Agradecemos imensamente a todos os alunos, professores e entusiastas que participaram desta demonstração de cronologia e aprendizado interativo!
            </p>
          </div>
          <div className="text-xs font-mono text-ink-soft/60 mt-4">
            Projeto de Pesquisa Escolar &copy; 2026
          </div>
        </div>

        {/* Bloco B: Tecnologia & Parceria SimpleRead */}
        <div className="rounded-xl border border-edge bg-panel p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-edge/40 pb-2">
            <div className="relative h-9 w-9 shrink-0 rounded-lg border border-edge bg-white p-0 overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/simpleread-favicon.ico"
                alt="SimpleRead Favicon"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <h5 className="text-base font-bold font-serif text-accent flex items-center gap-1.5">
                SimpleRead
              </h5>
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft">
                TECNOLOGIA PARCEIRA
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed text-ink font-serif">
            Esta experiência interativa utiliza e é impulsionada pela tecnologia de acessibilidade e leitura multissensorial da <a href="https://simpleread.foundation/" target="_blank" rel="noopener noreferrer" className="font-semibold underline text-accent hover:text-slate-700">SimpleRead</a>. A plataforma combina áudio, texto estruturado e apoio visual para tornar a leitura acessível a estudantes com dislexia, TDAH e neurodiversidades.
          </p>

          <div className="pt-1">
            <a
              href="https://simpleread.foundation/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <span>Acessar SimpleRead</span>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Botões do Rodapé */}
      <div className="pt-6 border-t border-edge/40 text-center">
        <button
          onClick={onRestart}
          className="w-full sm:w-auto rounded-lg border-2 border-accent bg-accent px-8 py-3.5 text-base font-bold text-white hover:bg-slate-850 shadow-md transition"
        >
          🔄 Recomeçar a Campanha
        </button>
      </div>
    </div>
  );
}
