// src/app/loading.tsx
export default function RootLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/60 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span className="text-lg font-bold tracking-wide text-emerald-300">
            CL
          </span>
        </div>

        {/* Spinner */}
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />

        <p className="text-xs text-slate-400">
          Loading your workspace…
        </p>
      </div>
    </main>
  );
}
