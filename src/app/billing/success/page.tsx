"use client";

import { useUiLanguage, UiLanguage } from "../../ui-language";

const SUCCESS_TEXTS: Record<
  UiLanguage,
  {
    title: string;
    message: string;
    backToBilling: string;
  }
> = {
  es: {
    title: "Pago completado ✅",
    message:
      "Tus créditos serán actualizados en unos momentos. Si no ves el cambio, refresca la página de Billing.",
    backToBilling: "Volver a Billing",
  },
  en: {
    title: "Payment completed ✅",
    message:
      "Your credits will be updated in a few moments. If you don’t see the change, refresh the Billing page.",
    backToBilling: "Back to Billing",
  },
};

export default function BillingSuccessPage() {
  const { uiLanguage } = useUiLanguage();
  const t = SUCCESS_TEXTS[uiLanguage];

  return (
    <main className="min-h-screen flex justify-center items-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 text-center text-slate-50">
        <h1 className="text-2xl font-semibold mb-2">{t.title}</h1>
        <p className="text-sm text-slate-300 mb-4">{t.message}</p>
        <a
          href="/billing"
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-900"
        >
          {t.backToBilling}
        </a>
      </div>
    </main>
  );
}
