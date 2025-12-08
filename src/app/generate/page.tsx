"use client";

import React, { useState } from "react";

export default function GeneratePage() {
  const [cv, setCv] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [letters, setLetters] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLetters([]);
    setLoading(true);

    try {
      const res = await fetch("/api/generate-cover-letters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cv, jobDescription, count }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      const data = await res.json();
      setLetters(data.letters || []);
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

  return (
    <main className="min-h-screen flex justify-center px-4 py-10 bg-slate-950">
      <div className="w-full max-w-3xl bg-slate-900 text-slate-50 rounded-2xl p-6 md:p-8 shadow-lg border border-slate-800">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">
          AI Cover Letter Generator
        </h1>
        <p className="text-sm text-slate-300 mb-6">
          Pega tu CV y la descripción de la vacante. La app generará varias
          cartas de presentación adaptadas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 font-medium">Tu CV</label>
            <textarea
              className="w-full h-32 md:h-40 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={cv}
              onChange={(e) => setCv(e.target.value)}
              placeholder="Pega aquí tu CV en texto..."
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">
              Descripción del puesto
            </label>
            <textarea
              className="w-full h-32 md:h-40 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Pega aquí la job description..."
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">
              Número de cartas a generar
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-20 rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Generando..." : "Generar cartas"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-400">Error: {error}</p>
        )}

        {letters.length > 0 && (
          <section className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Cartas generadas</h2>
            {letters.map((letter, idx) => (
              <article
                key={idx}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm whitespace-pre-line"
              >
                <div className="text-xs mb-1 text-slate-400">
                  Carta #{idx + 1}
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
