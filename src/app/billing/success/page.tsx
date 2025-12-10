// src/app/billing/success/page.tsx
export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen flex justify-center items-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 text-center text-slate-50">
        <h1 className="text-2xl font-semibold mb-2">Pago completado ✅</h1>
        <p className="text-sm text-slate-300 mb-4">
          Tus créditos serán actualizados en unos momentos. Si no ves el cambio,
          refresca la página de Billing.
        </p>
        <a
          href="/billing"
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-900"
        >
          Volver a Billing
        </a>
      </div>
    </main>
  );
}
