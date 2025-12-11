"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiLanguage } from "../ui-language";

type MeResponse =
  | { authenticated: false }
  | {
      authenticated: true;
      name: string | null;
      email: string;
      credits: number;
    };

const NAV_TEXTS = {
  es: {
    brand: "CoverLetter Generator",
    generate: "Generar",
    letters: "Mis cartas",
    billing: "Billing & créditos",
    login: "Iniciar sesión",
    signup: "Crear cuenta",
    logout: "Cerrar sesión",
    hello: "usuario",
    creditsLabel: "Créditos",
  },
  en: {
    brand: "CoverLetter AI",
    generate: "Generate",
    letters: "My letters",
    billing: "Billing & credits",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    hello: "user",
    creditsLabel: "Credits",
  },
} as const;

export default function Navbar() {
  const pathname = usePathname();
  const { uiLanguage } = useUiLanguage();
  const t = NAV_TEXTS[uiLanguage];

  const NAV_ITEMS = [
    { href: "/generate", label: t.generate },
    { href: "/letters", label: t.letters },
    { href: "/billing", label: t.billing },
  ];

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as MeResponse;
        if (!cancelled) {
          setMe(data);
        }
      } catch {
        if (!cancelled) {
          setMe({ authenticated: false });
        }
      } finally {
        if (!cancelled) {
          setLoadingMe(false);
        }
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  const isAuthed = me?.authenticated === true;
  const userName =
    isAuthed && "name" in (me || {})
      ? me.name || (me as any).email
      : null;
  const userCredits =
    isAuthed && "credits" in (me || {}) ? (me as any).credits : null;

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 gap-4">
        {/* Logo / marca */}
        <Link href="/generate" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center text-xs font-bold text-emerald-300">
            CL
          </div>
          <span className="text-sm font-semibold text-slate-50">
            {t.brand}
          </span>
        </Link>

        {/* Links + user panel */}
        <div className="flex flex-1 items-center justify-end gap-4">
          {/* Links de navegación */}
          <div className="flex items-center gap-2 text-sm">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    active
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/60"
                      : "text-slate-300 border border-transparent hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Panel de usuario / auth */}
          <div className="flex items-center gap-3 text-xs">
            {isAuthed && userName ? (
              <>
                {/* Créditos */}
                {typeof userCredits === "number" && (
                  <div className="rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-300">
                    {t.creditsLabel}:{" "}
                    <span className="font-semibold">{userCredits}</span>
                  </div>
                )}

                {/* Nombre */}
                <div className="hidden sm:flex max-w-[150px] flex-col text-right">
                  <span className="text-[11px] text-slate-400">
                    {t.hello}
                  </span>
                  <span className="truncate text-xs font-semibold text-slate-50">
                    {userName}
                  </span>
                </div>

                {/* Logout */}
                <Link
                  href="/api/auth/signout"
                  className="rounded-lg border border-slate-700 px-3 py-1 font-medium text-slate-200 hover:bg-slate-900"
                >
                  {t.logout}
                </Link>
              </>
            ) : (
              !loadingMe && (
                <>
                  <Link
                    href="/api/auth/signin"
                    className="rounded-lg border border-slate-700 px-3 py-1 font-medium text-slate-200 hover:bg-slate-900"
                  >
                    {t.login}
                  </Link>
                  <Link
                    href="/api/auth/signin"
                    className="rounded-lg bg-emerald-500 px-3 py-1 font-medium text-slate-900 hover:bg-emerald-400"
                  >
                    {t.signup}
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
