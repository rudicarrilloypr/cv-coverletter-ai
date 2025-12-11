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
    menu: "Menú",
  },
  en: {
    brand: "CoverLetter Generator",
    generate: "Generate",
    letters: "My letters",
    billing: "Billing & credits",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    hello: "user",
    creditsLabel: "Credits",
    menu: "Menu",
  },
} as const;

export default function Navbar() {
  const pathname = usePathname();
  const { uiLanguage, setUiLanguage } = useUiLanguage();
  const t = NAV_TEXTS[uiLanguage];

  const NAV_ITEMS = [
    { href: "/generate", label: t.generate },
    { href: "/letters", label: t.letters },
    { href: "/billing", label: t.billing },
  ];

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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

  function closeMenu() {
    setMenuOpen(false);
  }

  const LanguageToggle = (
    <div className="flex items-center gap-1 text-[11px]">
      <button
        type="button"
        onClick={() => setUiLanguage("es")}
        className={`px-2 py-1 rounded-full border transition ${
          uiLanguage === "es"
            ? "bg-emerald-500 text-slate-900 border-emerald-500"
            : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
        }`}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setUiLanguage("en")}
        className={`px-2 py-1 rounded-full border transition ${
          uiLanguage === "en"
            ? "bg-emerald-500 text-slate-900 border-emerald-500"
            : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
        }`}
      >
        EN
      </button>
    </div>
  );

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 py-3">
        {/* Barra principal */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo / marca */}
          <Link
            href="/generate"
            className="flex items-center gap-2"
            onClick={closeMenu}
          >
            <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center text-xs font-bold text-emerald-300">
              CL
            </div>
            <span className="text-sm font-semibold text-slate-50">
              {t.brand}
            </span>
          </Link>

          {/* DESKTOP: nav + idioma + usuario */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-4">
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

            {/* Toggle de idioma */}
            {LanguageToggle}

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
                  <div className="max-w-[180px] flex flex-col text-right">
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
                      href="/login"
                      className="rounded-lg border border-slate-700 px-3 py-1 font-medium text-slate-200 hover:bg-slate-900"
                    >
                      {t.login}
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-lg bg-emerald-500 px-3 py-1 font-medium text-slate-900 hover:bg-emerald-400"
                    >
                      {t.signup}
                    </Link>
                  </>
                )
              )}
            </div>
          </div>

          {/* MOBILE: idioma + créditos + usuario + burger */}
          <div className="flex flex-1 items-center justify-end gap-2 md:hidden">
            {/* Idioma en mobile */}
            {LanguageToggle}

            {isAuthed && typeof userCredits === "number" && (
              <div className="rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                {t.creditsLabel}:{" "}
                <span className="font-semibold">{userCredits}</span>
              </div>
            )}

            {isAuthed && userName && (
              <div className="max-w-[120px] flex flex-col text-right">
                <span className="text-[10px] text-slate-500">
                  {t.hello}
                </span>
                <span className="truncate text-[11px] font-semibold text-slate-50">
                  {userName}
                </span>
              </div>
            )}

            {/* Botón burger */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
              aria-label={t.menu}
              aria-expanded={menuOpen}
            >
              <div className="flex flex-col items-center justify-center gap-[3px]">
                <span className="block h-[2px] w-4 rounded-full bg-slate-100" />
                <span className="block h-[2px] w-4 rounded-full bg-slate-100" />
                <span className="block h-[2px] w-4 rounded-full bg-slate-100" />
              </div>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="mt-3 space-y-3 border-t border-slate-800 pt-3 md:hidden">
            {/* Links de navegación */}
            <div className="flex flex-col gap-1 text-sm">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`w-full rounded-lg px-3 py-2 text-left transition ${
                      active
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/60"
                        : "text-slate-200 border border-slate-800 hover:bg-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Auth buttons en mobile */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              {isAuthed && userName ? (
                <Link
                  href="/api/auth/signout"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-3 py-1 font-medium text-slate-200 hover:bg-slate-900"
                >
                  {t.logout}
                </Link>
              ) : (
                !loadingMe && (
                  <>
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-3 py-1 font-medium text-slate-200 hover:bg-slate-900"
                    >
                      {t.login}
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMenu}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-1 font-medium text-slate-900 hover:bg-emerald-400"
                    >
                      {t.signup}
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
