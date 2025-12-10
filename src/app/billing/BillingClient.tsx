/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/billing/BillingClient.tsx
"use client";

import { useState } from "react";

type CreditPackId = "starter" | "pro" | "ultimate";

type PurchaseDTO = {
  id: string;
  stripeId: string;
  packId: string;
  credits: number;
  amount: number;
  currency: string;
  createdAt: string; // ISO string
};

type BillingClientProps = {
  initialCredits: number;
  initialPurchases: PurchaseDTO[];
};

const CREDIT_PACKS_UI: {
  id: CreditPackId;
  name: string;
  credits: number;
  priceLabel: string;
  highlight?: boolean;
}[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 10,
    priceLabel: "$5 USD (ejemplo)",
  },
  {
    id: "pro",
    name: "Pro",
    credits: 30,
    priceLabel: "$12 USD (ejemplo)",
    highlight: true,
  },
  {
    id: "ultimate",
    name: "Ultimate",
    credits: 80,
    priceLabel: "$25 USD (ejemplo)",
  },
];

export default function BillingClient({
  initialCredits,
  initialPurchases,
}: BillingClientProps) {
  const [credits, setCredits] = useState(initialCredits);
  const [loadingPack, setLoadingPack] = useState<CreditPackId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchases] = useState<PurchaseDTO[]>(initialPurchases);

  async function handleBuy(packId: CreditPackId) {
    try {
      setError(null);
      setLoadingPack(packId);

      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "No se pudo crear la sesión de pago.");
      }

      // Redirigir a Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      setError(
        err?.message ??
          "Ocurrió un error al crear la sesión de pago. Intenta de nuevo."
      );
    } finally {
      setLoadingPack(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            Billing & Créditos
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Compra paquetes de créditos para generar cartas de presentación con
            la IA.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-right">
          <p className="text-xs text-slate-300">Créditos disponibles</p>
          <p className="text-lg font-semibold text-emerald-400">
            {credits}
          </p>
        </div>
      </header>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 border border-red-500/40 bg-red-500/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Cards de paquetes */}
      <section className="grid gap-4 md:grid-cols-3">
        {CREDIT_PACKS_UI.map((pack) => (
          <article
            key={pack.id}
            className={`rounded-2xl border px-4 py-4 flex flex-col justify-between bg-slate-950/60 ${
              pack.highlight
                ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : "border-slate-700"
            }`}
          >
            <div>
              <h2 className="text-lg font-semibold mb-1">{pack.name}</h2>
              <p className="text-sm text-slate-300 mb-2">
                {pack.credits} créditos
              </p>
              <p className="text-xs text-slate-400">{pack.priceLabel}</p>
            </div>

            <button
              type="button"
              onClick={() => handleBuy(pack.id)}
              disabled={loadingPack === pack.id}
              className={`mt-4 w-full rounded-xl px-3 py-2 text-sm font-semibold transition ${
                pack.highlight
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-50"
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loadingPack === pack.id ? "Redirigiendo..." : "Comprar créditos"}
            </button>
          </article>
        ))}
      </section>

      {/* Historial de compras */}
      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Historial de compras</h2>

        {purchases.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aún no has comprado créditos. Una vez que realices tu primera
            compra, verás aquí el historial de pagos.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/80">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Paquete</th>
                  <th className="px-4 py-3">Créditos</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3 hidden md:table-cell">Stripe ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {purchases.map((p) => {
                  const date = new Date(p.createdAt);
                  const formattedDate = date.toLocaleString("es-MX", {
                    dateStyle: "short",
                    timeStyle: "short",
                  });

                  const amountFormatted =
                    p.amount > 0
                      ? `${(p.amount / 100).toFixed(2)} ${p.currency.toUpperCase()}`
                      : "-";

                  const packLabel =
                    p.packId.charAt(0).toUpperCase() + p.packId.slice(1);

                  return (
                    <tr key={p.id} className="text-slate-200">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {packLabel}
                      </td>
                      <td className="px-4 py-3">{p.credits}</td>
                      <td className="px-4 py-3">{amountFormatted}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">
                        {p.stripeId}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-slate-500 mt-4">
        Después de completar el pago en Stripe, serás redirigido de vuelta a la
        app. Tus créditos se actualizarán automáticamente gracias al webhook.
        Si no ves el cambio al instante, actualiza la página.
      </p>
    </div>
  );
}
