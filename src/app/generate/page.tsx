/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { useUiLanguage, UiLanguage } from "../ui-language";

type CoverLetterMode = "standard" | "concise" | "storytelling" | "technical";
type CoverLetterLanguage = "auto" | "spanish" | "english";

const UI_TEXTS: Record<
  UiLanguage,
  {
    pageTitle: string;
    pageSubtitle: string;
    userNameLabel: string;
    userNamePlaceholder: string;
    userNameHelper: string;
    cvLabel: string;
    cvPlaceholder: string;
    jdLabel: string;
    jdPlaceholder: string;
    countLabel: string;
    modeLabel: string;
    modeOptionStandard: string;
    modeOptionConcise: string;
    modeOptionStorytelling: string;
    modeOptionTechnical: string;
    letterLangLabel: string;
    letterLangAuto: string;
    letterLangSpanish: string;
    letterLangEnglish: string;
    submitGenerating: string;
    submitGenerate: string;
    errorPrefix: string;
    generatedTitle: string;
    downloadAll: string;
    letterIndexLabel: (i: number) => string;
    copy: string;
    copied: string;
    pdfButton: string;
    uiLangLabel: string;
  }
> = {
  es: {
    pageTitle: "Generador de Cartas de Presentación",
    pageSubtitle:
      "Pega tu CV y la descripción de la vacante. La app generará varias cartas de presentación adaptadas.",
    userNameLabel: "Tu nombre completo (para firmar la carta)",
    userNamePlaceholder: "Ej. John P. Doe",
    userNameHelper:
      "Si lo dejas vacío, la carta no llevará firma automática.",
    cvLabel: "Tu CV",
    cvPlaceholder: "Pega aquí tu CV en texto...",
    jdLabel: "Descripción del puesto",
    jdPlaceholder: "Pega aquí la descripción del empleo...",
    countLabel: "Número de cartas a generar",
    modeLabel: "Estilo de carta",
    modeOptionStandard: "Profesional balanceada (recomendada)",
    modeOptionConcise: "Breve y directa",
    modeOptionStorytelling: "Storytelling / narrativa",
    modeOptionTechnical: "Muy técnica (roles de ingeniería)",
    letterLangLabel: "Idioma de la carta",
    letterLangAuto: "Detectar automáticamente (según la vacante)",
    letterLangSpanish: "Español",
    letterLangEnglish: "Ingles",
    submitGenerating: "Generando...",
    submitGenerate: "Generar cartas",
    errorPrefix: "Error:",
    generatedTitle: "Cartas generadas",
    downloadAll: "Descargar todas en PDF",
    letterIndexLabel: (i: number) => `Carta #${i}`,
    copy: "Copiar",
    copied: "Copiada ✓",
    pdfButton: "PDF",
    uiLangLabel: "Idioma de la interfaz",
  },
  en: {
    pageTitle: "Cover Letter Generator",
    pageSubtitle:
      "Paste your resume and the job description. The app will generate several tailored cover letters.",
    userNameLabel: "Your full name (for the signature)",
    userNamePlaceholder: "e.g. John P. Doe",
    userNameHelper:
      "If left empty, the cover letters will not include an automatic signature.",
    cvLabel: "Your résumé / CV",
    cvPlaceholder: "Paste your CV text here...",
    jdLabel: "Job description",
    jdPlaceholder: "Paste the job description here...",
    countLabel: "Number of cover letters to generate",
    modeLabel: "Cover letter style",
    modeOptionStandard: "Balanced professional (recommended)",
    modeOptionConcise: "Short & direct",
    modeOptionStorytelling: "Storytelling / narrative",
    modeOptionTechnical: "Highly technical (engineering roles)",
    letterLangLabel: "Cover letter language",
    letterLangAuto: "Detect automatically (based on job description)",
    letterLangSpanish: "Spanish",
    letterLangEnglish: "English",
    submitGenerating: "Generating...",
    submitGenerate: "Generate cover letters",
    errorPrefix: "Error:",
    generatedTitle: "Generated cover letters",
    downloadAll: "Download all as PDF",
    letterIndexLabel: (i: number) => `Letter #${i}`,
    copy: "Copy",
    copied: "Copied ✓",
    pdfButton: "PDF",
    uiLangLabel: "Interface language",
  },
};

export default function GeneratePage() {
  const [cv, setCv] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [count, setCount] = useState(3);
  const [mode, setMode] = useState<CoverLetterMode>("standard");
  const [language, setLanguage] = useState<CoverLetterLanguage>("auto");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [letters, setLetters] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  const { uiLanguage, setUiLanguage } = useUiLanguage();
  const t = UI_TEXTS[uiLanguage];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLetters([]);
    setLoading(true);
    setCopiedIndex(null);

    try {
      const res = await fetch("/api/generate-cover-letters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cv,
          jobDescription,
          count,
          mode,
          language,
          userName,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // por si la respuesta no es JSON
      }

      if (!res.ok) {
        const apiMessage =
          data && typeof data.error === "string" ? data.error : null;
        throw new Error(apiMessage || "Request failed");
      }

      const lettersFromApi = Array.isArray(data?.letters) ? data.letters : [];
      setLetters(lettersFromApi);

      if (typeof data?.remainingCredits === "number") {
        setCredits(data.remainingCredits);
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Unexpected error";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(letter: string, index: number) {
    try {
      await navigator.clipboard.writeText(letter);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setError("No se pudo copiar la carta al portapapeles.");
    }
  }

  function downloadSinglePdf(letter: string, index: number) {
    try {
      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
      });

      const margin = 40;
      const lineHeight = 16;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - margin * 2;

      const lines = doc.splitTextToSize(letter, maxWidth);

      let cursorY = margin;

      lines.forEach((line: string) => {
        if (cursorY + lineHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight;
      });

      doc.save(`cover-letter-${index + 1}.pdf`);
    } catch (e) {
      console.error(e);
      setError("No se pudo generar el PDF de la carta.");
    }
  }

  function downloadAllPdf() {
    if (letters.length === 0) return;

    try {
      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
      });

      const margin = 40;
      const lineHeight = 16;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - margin * 2;

      letters.forEach((letter, idx) => {
        if (idx > 0) {
          doc.addPage();
        }

        const header = t.letterIndexLabel(idx + 1);
        let cursorY = margin;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(header, margin, cursorY);
        cursorY += lineHeight * 1.5;

        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(letter, maxWidth);

        lines.forEach((line: string) => {
          if (cursorY + lineHeight > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
          }
          doc.text(line, margin, cursorY);
          cursorY += lineHeight;
        });
      });

      doc.save("cover-letters.pdf");
    } catch (e) {
      console.error(e);
      setError("No se pudo generar el PDF con todas las cartas.");
    }
  }

  return (
    <main className="min-h-screen flex justify-center px-4 py-10 bg-slate-950">
      <div className="w-full max-w-3xl bg-slate-900 text-slate-50 rounded-2xl p-6 md:p-8 shadow-lg border border-slate-800">
        {/* Header con selector de idioma de interfaz */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              {t.pageTitle}
            </h1>
            <p className="text-sm text-slate-300 mb-2">{t.pageSubtitle}</p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 text-xs">
            <label className="font-medium">{t.uiLangLabel}</label>
            <select
              value={uiLanguage}
              onChange={(e) => setUiLanguage(e.target.value as UiLanguage)}
              className="rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del usuario */}
          <div>
            <label className="block text-sm mb-1 font-medium">
              {t.userNameLabel}
            </label>
            <input
              type="text"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t.userNamePlaceholder}
            />
            <p className="text-xs text-slate-400 mt-1">{t.userNameHelper}</p>
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">
              {t.cvLabel}
            </label>
            <textarea
              className="w-full h-32 md:h-40 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={cv}
              onChange={(e) => setCv(e.target.value)}
              placeholder={t.cvPlaceholder}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">
              {t.jdLabel}
            </label>
            <textarea
              className="w-full h-32 md:h-40 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={t.jdPlaceholder}
              required
            />
          </div>

          {/* Controles de número / estilo / idioma en grid responsivo */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {/* Número de cartas */}
            <div className="rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-3 flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                {t.countLabel}
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="mt-1 w-24 md:w-full max-w-[120px] rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Estilo de carta */}
            <div className="rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-3 flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                {t.modeLabel}
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as CoverLetterMode)}
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="standard">{t.modeOptionStandard}</option>
                <option value="concise">{t.modeOptionConcise}</option>
                <option value="storytelling">
                  {t.modeOptionStorytelling}
                </option>
                <option value="technical">{t.modeOptionTechnical}</option>
              </select>
            </div>

            {/* Idioma de la carta */}
            <div className="rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-3 flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-200">
                {t.letterLangLabel}
              </label>
              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as CoverLetterLanguage)
                }
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="auto">{t.letterLangAuto}</option>
                <option value="spanish">{t.letterLangSpanish}</option>
                <option value="english">{t.letterLangEnglish}</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? t.submitGenerating : t.submitGenerate}
          </button>

          {credits !== null && (
            <p className="mt-2 text-xs text-slate-400">
              Créditos restantes:{" "}
              <span className="font-semibold">{credits}</span>
            </p>
          )}
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-400">
            {t.errorPrefix} {error}
          </p>
        )}

        {letters.length > 0 && (
          <section className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h2 className="text-lg font-semibold">{t.generatedTitle}</h2>

              <button
                type="button"
                onClick={downloadAllPdf}
                className="self-start sm:self-auto text-xs px-3 py-1 rounded-lg border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition"
              >
                {t.downloadAll}
              </button>
            </div>

            {letters.map((letter, idx) => (
              <article
                key={idx}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm whitespace-pre-line"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="text-xs text-slate-400">
                    {t.letterIndexLabel(idx + 1)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(letter, idx)}
                      className="text-xs px-2 py-1 rounded-lg border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition"
                    >
                      {copiedIndex === idx ? t.copied : t.copy}
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadSinglePdf(letter, idx)}
                      className="text-xs px-2 py-1 rounded-lg border border-slate-500 text-slate-200 hover:bg-slate-700/60 transition"
                    >
                      {t.pdfButton}
                    </button>
                  </div>
                </div>
                {letter}
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
