"use client";

import { useUiLanguage, UiLanguage } from "../../ui-language";

const CANCEL_TEXTS: Record<
  UiLanguage,
  {
    title: string;
    message: string;
    backToBilling: string;
  }
> = {
  es: {
    title: "Pago cancelado",
    message:
      "No se han realizado cargos. Puedes intentar de nuevo cuando quieras.",
    backToBilling: "Volver a Billing",
  },
  en: {
    title: "Payment canceled",
    message:
      "No charges have been made. You can try again whenever you want.",
    backToBilling: "Back to Billing",
  },
};

export default function BillingCancelPage() {
  const { uiLanguage } = useUiLanguage();
  const t = CANCEL_TEXTS[uiLanguage];

  return (
    <main className="min-h-screen flex justify-center items-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center text-slate-50">
        <h1 className="text-2xl font-semibold mb-2">{t.title}</h1>
        <p className="text-sm text-slate-300 mb-4">{t.message}</p>
        <a
          href="/billing"
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600"
        >
          {t.backToBilling}
        </a>
      </div>
    </main>
  );
}
