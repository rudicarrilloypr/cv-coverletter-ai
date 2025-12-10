// src/app/billing/cancel/page.tsx
export default function BillingCancelPage() {
  return (
    <main className="min-h-screen flex justify-center items-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center text-slate-50">
        <h1 className="text-2xl font-semibold mb-2">Pago cancelado</h1>
        <p className="text-sm text-slate-300 mb-4">
          No se han realizado cargos. Puedes intentar de nuevo cuando quieras.
        </p>
        <a
          href="/billing"
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600"
        >
          Volver a Billing
        </a>
      </div>
    </main>
  );
}
