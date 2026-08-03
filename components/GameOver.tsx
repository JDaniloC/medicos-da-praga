// components/GameOver.tsx
"use client";

import { useState } from "react";
import type { DebriefingItem } from "@/lib/story/schema";

const DEFAULT_DEBRIEFING: DebriefingItem[] = [
  {
    id: "guerra_cem_anos",
    icon: "⚔️",
    title: "A Guerra dos Cem Anos",
    subtitle: "Inspiração Histórica (1337–1453)",
    image: "/images/debriefing/war.png",
    content:
      "O conflito geopolítico do jogo entre Anglia e Gália foi inspirado na longa e devastadora Guerra dos Cem Anos (1337–1453) travada entre Inglaterra e França, marcada por cercos sangrentos e instabilidade social.",
  },
  {
    id: "cerco_caffa",
    icon: "🏰",
    title: "O Cerco de Caffa e a Primeira Guerra Biológica",
    subtitle: "Crimeia, por volta de 1346",
    image: "/images/debriefing/caffa.png",
    content:
      "O momento em que o Canato propõe lançar corpos infectados sobre as muralhas é um fato histórico real! O Cerco de Caffa envolveu as forças mongóis arremessando cadáveres com a Peste Negra para dentro da cidade sitiada. Embora não tivessem conhecimento sobre vírus ou bactérias na época, essa é considerada uma das primeiras formas registradas de guerra biológica da humanidade.",
  },
  {
    id: "medicos_peste",
    icon: "🎭",
    title: "Os Médicos da Peste",
    subtitle: "O Famoso Traje de Bico de Pássaro",
    image: "/images/debriefing/doctor.png",
    content:
      "O traje característico (com o manto de couro grosso e a famosa máscara em formato de bico de pássaro) começou a ser desenhado na Europa medieval/renascentista. O bico era preenchido com ervas aromáticas, cânfora e vinagre para filtrar o ar que o médico respirava.",
  },
  {
    id: "humores_miasma",
    icon: "🧪",
    title: "A Teoria dos Humores e do Miasma",
    subtitle: "Os Erros da Ciência Antiga",
    image: "/images/debriefing/miasma.png",
    content:
      "Durante séculos, a humanidade acreditou que as doenças surgiam do desequilíbrio entre os fluidos corporais (Teoria dos Humores) ou pelo \"Miasma\" — um ar infectado e pútrido oriundo de matéria em decomposição. Hoje sabemos que a Varíola e a Peste são causadas por microrganismos (vírus e bactérias).",
  },
  {
    id: "lado_positivo_miasma",
    icon: "🧼",
    title: "O Lado Positivo da Teoria do Miasma",
    subtitle: "A Revolução da Higiene e Medicina Sanitária",
    image: "/images/debriefing/sanitation.png",
    content:
      "Apesar de a Teoria do Miasma estar cientificamente errada sobre a origem das infecções, ela teve um impacto positivo gigante! Ao acreditarem que o \"ar ruim\" e a sujeira causavam as pragas, médicos e governantes europeus passaram a incentivar a limpeza de ruas, a drenagem de pântanos, o escoamento de latrinas e a ventilação de hospitais. Essas práticas pioneiras de higienização ajudaram a conter diversas epidemias e abriram caminho para a medicina sanitária.",
  },
];

// -----------------------------------------------------------------------------
// COMPONENTE 1: GameOver (Fim de Jogo / Vitória da Narrativa)
// Mantido simples e focado, aparecendo abaixo da narração para preservar imersão.
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
// Tela dedicada que ocupa o espaço total com layout premium, livre da UI do jogo.
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
    <div className="fade-in space-y-8 rounded-2xl border border-edge/80 bg-panel p-6 sm:p-8 md:p-12 shadow-xl text-ink max-w-5xl mx-auto">
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

      {/* Nota do Desenvolvedor (Design Elegante e Limpo) */}
      <div className="relative overflow-hidden rounded-xl border-l-4 border-amber-600 bg-amber-500/[0.04] p-6 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-amber-800 mb-2.5 text-xs uppercase tracking-wider">
          <span className="text-base">📍</span> Nota do Desenvolvedor
        </div>
        <p className="text-sm leading-relaxed text-ink/90 font-serif italic">
          Esta é uma versão de demonstração (Demo) desenvolvida para apresentação escolar, fazendo parte do projeto de pesquisa de <strong className="font-semibold text-accent">Mestrado</strong>. O projeto foi idealizado e desenvolvido em colaboração com a empresa de um amigo e parceiro de tecnologia.
        </p>
      </div>

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

        {/* MODO CARROSSEL (Split-Layout Amplo) */}
        {viewMode === "carousel" ? (
          <div className="space-y-5">
            {/* Abas Superiores Rápidas */}
            <div
              className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-edge/40 snap-x snap-mandatory"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {items.map((item, idx) => (
                <button
                  key={item.id || idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold font-serif transition-all snap-start ${
                    idx === activeIndex
                      ? "border-accent bg-accent text-white shadow-sm scale-105"
                      : "border-edge bg-panel-strong text-ink-soft hover:border-accent hover:text-ink"
                  }`}
                >
                  <span>{item.icon ?? "📜"}</span>
                  <span>{item.title.split(":")[0]}</span>
                </button>
              ))}
            </div>

            {/* Split layout: Imagem na esquerda, texto na direita */}
            <div className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[1.1fr_1fr] gap-6 rounded-xl border border-edge bg-panel p-5 shadow-sm items-center">
              {/* Moldura da imagem (Quadrada e Snug Fit) */}
              <div className="rounded-lg border border-edge bg-slate-950/5 p-0 flex items-center justify-center aspect-square w-full max-w-[360px] md:max-w-none mx-auto overflow-hidden">
                {currentItem.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentItem.image}
                    alt={currentItem.title}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-4xl">{currentItem.icon ?? "📜"}</div>
                )}
              </div>

              {/* Informações Textuais e Legibilidade */}
              <div className="flex flex-col justify-between space-y-4 py-2">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="inline-block rounded bg-amber-150 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-900 border border-amber-300/40">
                      {currentItem.subtitle ?? "Contexto Histórico"}
                    </span>
                    <h5 className="text-xl sm:text-2xl font-bold font-serif text-accent leading-tight flex items-center gap-2">
                      <span>{currentItem.icon ?? "📜"}</span>
                      <span>{currentItem.title}</span>
                    </h5>
                  </div>
                  <p className="text-base leading-relaxed text-ink font-serif">
                    {currentItem.content}
                  </p>
                </div>

                {/* Controles do Carrossel */}
                <div className="flex items-center justify-between pt-4 border-t border-edge/40">
                  <button
                    onClick={handlePrev}
                    className="rounded-md border border-edge bg-panel px-3.5 py-2 text-xs font-bold text-accent hover:bg-panel-strong transition"
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
                    className="rounded-md border border-accent bg-accent px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
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
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <div className="space-y-2 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300/40">
                    {item.subtitle}
                  </span>
                  <h5 className="font-bold font-serif text-accent text-base sm:text-lg flex items-center gap-2 mt-1">
                    <span>{item.icon ?? "📜"}</span>
                    <span>{item.title}</span>
                  </h5>
                  <p className="text-sm leading-relaxed text-ink font-serif">
                    {item.content}
                  </p>
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
