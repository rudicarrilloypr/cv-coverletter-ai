// src/app/letters/LettersClient.tsx
"use client";

import { useMemo, useState } from "react";
import { useUiLanguage, UiLanguage } from "../ui-language";

type CoverLetterDTO = {
  id: string;
  jobTitle: string;
  company: string;
  jobLink: string | null;
  jobSummary: string | null;
  letter: string;
  createdAt: string; // ISO
};

type LettersClientProps = {
  initialLetters: CoverLetterDTO[];
};

const STRINGS: Record<
  UiLanguage,
  {
    title: string;
    subtitle: string;
    statLabel: string;
    emptyTitle: string;
    emptySubtitle: string;
    historyHeading: string;
    detailHeading: string;
    jobNotSpecified: string;
    companyNotSpecified: string;
    viewJobLink: string;
    copyButton: string;
    copySuccess: string;
    copyError: string;
    selectPrompt: string;
  }
> = {
  es: {
    title: "Mis cartas de presentación",
    subtitle:
      "Aquí puedes revisar, copiar y reutilizar las cartas que has generado con la app.",
    statLabel: "Cartas generadas",
    emptyTitle: "Todavía no has generado ninguna carta de presentación.",
    emptySubtitle:
      "Genera tu primera carta desde el flujo principal y aparecerá aquí.",
    historyHeading: "Historial",
    detailHeading: "Detalle",
    jobNotSpecified: "Puesto no especificado",
    companyNotSpecified: "Empresa no especificada",
    viewJobLink: "Ver oferta de trabajo",
    copyButton: "Copiar carta",
    copySuccess: "Copiada al portapapeles ✅",
    copyError: "No se pudo copiar 😕",
    selectPrompt: "Selecciona una carta del historial para verla aquí.",
  },
  en: {
    title: "My cover letters",
    subtitle:
      "Here you can review, copy and reuse the letters you have generated with the app.",
    statLabel: "Generated letters",
    emptyTitle: "You haven't generated any cover letters yet.",
    emptySubtitle:
      "Generate your first letter in the main flow and it will appear here.",
    historyHeading: "History",
    detailHeading: "Details",
    jobNotSpecified: "Job title not specified",
    companyNotSpecified: "Company not specified",
    viewJobLink: "View job posting",
    copyButton: "Copy letter",
    copySuccess: "Copied to clipboard ✅",
    copyError: "Could not copy 😕",
    selectPrompt: "Select a letter from the history to view it here.",
  },
};

export default function LettersClient({ initialLetters }: LettersClientProps) {
  const [letters] = useState<CoverLetterDTO[]>(initialLetters);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialLetters[0]?.id ?? null
  );
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
const { uiLanguage, setUiLanguage } = useUiLanguage();
const t = STRINGS[uiLanguage];


  const selectedLetter = useMemo(
    () => letters.find((l) => l.id === selectedId) ?? null,
    [letters, selectedId]
  );

  async function handleCopy() {
    if (!selectedLetter) return;
    try {
      await navigator.clipboard.writeText(selectedLetter.letter);
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  }

const dateLocale = uiLanguage === "es" ? "es-MX" : "en-US";

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            {t.title}
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            {t.subtitle}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Language toggle */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setUiLanguage("es")}
              className={`px-2 py-1 text-xs rounded-md border transition ${
                uiLanguage === "es"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setUiLanguage("en")}
              className={`px-2 py-1 text-xs rounded-md border transition ${
                uiLanguage === "en"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
            >
              EN
            </button>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2 text-right">
            <p className="text-xs text-slate-400">{t.statLabel}</p>
            <p className="text-lg font-semibold text-slate-50">
              {letters.length}
            </p>
          </div>
        </div>
      </header>

      {letters.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-300">
          {t.emptyTitle}
          <br />
          {t.emptySubtitle}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Lista de cartas */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
              {t.historyHeading}
            </h2>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2">
              {letters.map((letter) => {
                const date = new Date(letter.createdAt);
                const formattedDate = date.toLocaleString(dateLocale, {
                  dateStyle: "short",
                  timeStyle: "short",
                });

                const snippet =
                  letter.letter.length > 160
                    ? letter.letter.slice(0, 160) + "…"
                    : letter.letter;

                const active = letter.id === selectedId;

                return (
                  <button
                    key={letter.id}
                    type="button"
                    onClick={() => setSelectedId(letter.id)}
                    className={`w-full text-left rounded-xl border px-3 py-3 text-sm transition ${
                      active
                        ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.25)]"
                        : "border-slate-700 bg-slate-950/40 hover:border-slate-500 hover:bg-slate-900/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold truncate">
                        {letter.jobTitle || t.jobNotSpecified}
                      </p>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {formattedDate}
                      </span>
                    </div>

                    <p className="text-xs text-emerald-400 mb-1">
                      {letter.company || t.companyNotSpecified}
                    </p>

                    {letter.jobSummary && (
                      <p className="text-xs text-slate-400 mb-1 line-clamp-2">
                        {letter.jobSummary}
                      </p>
                    )}

                    <p className="text-xs text-slate-300 line-clamp-2">
                      {snippet}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Detalle de carta seleccionada */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
              {t.detailHeading}
            </h2>

            {selectedLetter ? (
              <div className="h-full flex flex-col rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">
                    {selectedLetter.jobTitle || t.jobNotSpecified}
                  </h3>
                  <p className="text-sm text-emerald-400">
                    {selectedLetter.company || t.companyNotSpecified}
                  </p>
                  {selectedLetter.jobLink && (
                    <a
                      href={selectedLetter.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:underline mt-1 inline-block"
                    >
                      {t.viewJobLink}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                  >
                    {t.copyButton}
                  </button>

                  {copyStatus === "success" && (
                    <span className="text-[11px] text-emerald-400">
                      {t.copySuccess}
                    </span>
                  )}
                  {copyStatus === "error" && (
                    <span className="text-[11px] text-red-400">
                      {t.copyError}
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-3">
                  <p className="whitespace-pre-wrap text-sm text-slate-100 leading-relaxed">
                    {selectedLetter.letter}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-300">
                {t.selectPrompt}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
