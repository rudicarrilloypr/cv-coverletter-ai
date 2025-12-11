/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useUiLanguage, UiLanguage } from "../ui-language";

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

const BILLING_TEXTS: Record<
  UiLanguage,
  {
    title: string;
    subtitle: string;
    creditsLabel: string;
    buyButton: string;
    redirecting: string;
    errorFallback: string;
    historyTitle: string;
    historyEmptyTitle: string;
    historyEmptyBody: string;
    thDate: string;
    thPack: string;
    thCredits: string;
    thAmount: string;
    thStripeId: string;
    footerInfo: string;
  }
> = {
  es: {
    title: "Billing & Créditos",
    subtitle:
      "Compra paquetes de créditos para generar cartas de presentación con la IA.",
    creditsLabel: "Créditos disponibles",
    buyButton: "Comprar créditos",
    redirecting: "Redirigiendo...",
    errorFallback:
      "Ocurrió un error al crear la sesión de pago. Intenta de nuevo.",
    historyTitle: "Historial de compras",
    historyEmptyTitle: "Aún no has comprado créditos.",
    historyEmptyBody:
      "Cuando realices tu primera compra, verás aquí el historial de pagos.",
    thDate: "Fecha",
    thPack: "Paquete",
    thCredits: "Créditos",
    thAmount: "Monto",
    thStripeId: "Stripe ID",
    footerInfo:
      "Después de completar el pago en Stripe, serás redirigido de vuelta a la app. Tus créditos se actualizarán automáticamente gracias al webhook. Si no ves el cambio al instante, actualiza la página.",
  },
  en: {
    title: "Billing & Credits",
    subtitle: "Buy credit packs to generate cover letters with AI.",
    creditsLabel: "Available credits",
    buyButton: "Buy credits",
    redirecting: "Redirecting...",
    errorFallback:
      "An error occurred while creating the payment session. Please try again.",
    historyTitle: "Purchase history",
    historyEmptyTitle: "You haven't purchased any credits yet.",
    historyEmptyBody:
      "Once you complete your first purchase, your payment history will appear here.",
    thDate: "Date",
    thPack: "Pack",
    thCredits: "Credits",
    thAmount: "Amount",
    thStripeId: "Stripe ID",
    footerInfo:
      "After completing the payment in Stripe, you'll be redirected back to the app. Your credits will be updated automatically via the webhook. If you don’t see the change immediately, refresh the Billing page.",
  },
};

const CREDIT_PACKS_UI: {
  id: CreditPackId;
  name: { es: string; en: string };
  credits: number;
  priceLabel: { es: string; en: string };
  highlight?: boolean;
}[] = [
  {
    id: "starter",
    name: { es: "Starter", en: "Starter" },
    credits: 10,
    priceLabel: {
      es: "$5 USD (ejemplo)",
      en: "$5 USD (example)",
    },
  },
  {
    id: "pro",
    name: { es: "Pro", en: "Pro" },
    credits: 30,
    priceLabel: {
      es: "$12 USD (ejemplo)",
      en: "$12 USD (example)",
    },
    highlight: true,
  },
  {
    id: "ultimate",
    name: { es: "Ultimate", en: "Ultimate" },
    credits: 80,
    priceLabel: {
      es: "$25 USD (ejemplo)",
      en: "$25 USD (example)",
    },
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

  const { uiLanguage, setUiLanguage } = useUiLanguage();
  const t = BILLING_TEXTS[uiLanguage];
  const dateLocale = uiLanguage === "es" ? "es-MX" : "en-US";

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
        throw new Error(data?.error || t.errorFallback);
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err?.message ?? t.errorFallback);
    } finally {
      setLoadingPack(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">{t.title}</h1>
          <p className="text-sm text-slate-300 mt-1">{t.subtitle}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Toggle ES | EN */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setUiLanguage("es")}
              className={`px-2 py-1 rounded-md border transition ${
                uiLanguage === "es"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                  : "border-slate-600 hover:border-slate-400"
              }`}
            >
              ES
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={() => setUiLanguage("en")}
              className={`px-2 py-1 rounded-md border transition ${
                uiLanguage === "en"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                  : "border-slate-600 hover:border-slate-400"
              }`}
            >
              EN
            </button>
          </div>

          {/* Créditos disponibles */}
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-right">
            <p className="text-xs text-slate-300">{t.creditsLabel}</p>
            <p className="text-lg font-semibold text-emerald-400">{credits}</p>
          </div>
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
              <h2 className="text-lg font-semibold mb-1">
                {pack.name[uiLanguage]}
              </h2>
              <p className="text-sm text-slate-300 mb-2">
                {pack.credits}{" "}
                {uiLanguage === "es" ? "créditos" : "credits"}
              </p>
              <p className="text-xs text-slate-400">
                {pack.priceLabel[uiLanguage]}
              </p>
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
              {loadingPack === pack.id ? t.redirecting : t.buyButton}
            </button>
          </article>
        ))}
      </section>

      {/* Historial de compras */}
      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">{t.historyTitle}</h2>

        {purchases.length === 0 ? (
          <p className="text-sm text-slate-400">
            {t.historyEmptyTitle} {t.historyEmptyBody}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/80">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">{t.thDate}</th>
                  <th className="px-4 py-3">{t.thPack}</th>
                  <th className="px-4 py-3">{t.thCredits}</th>
                  <th className="px-4 py-3">{t.thAmount}</th>
                  <th className="px-4 py-3 hidden md:table-cell">
                    {t.thStripeId}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {purchases.map((p) => {
                  const date = new Date(p.createdAt);
                  const formattedDate = date.toLocaleString(dateLocale, {
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

      <p className="text-xs text-slate-500 mt-4">{t.footerInfo}</p>
    </div>
  );
}
