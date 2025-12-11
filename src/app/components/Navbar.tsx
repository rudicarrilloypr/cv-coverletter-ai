"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiLanguage } from "../ui-language";

const NAV_TEXTS = {
  es: {
    brand: "CoverLetter Generator",
    generate: "Generar",
    letters: "Mis cartas",
    billing: "Billing & créditos",
  },
  en: {
    brand: "CoverLetter AI",
    generate: "Generate",
    letters: "My letters",
    billing: "Billing & credits",
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

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo / marca */}
        <Link href="/generate" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/60 flex items-center justify-center text-xs font-bold text-emerald-300">
            CL
          </div>
          <span className="text-sm font-semibold text-slate-50">
            {t.brand}
          </span>
        </Link>

        {/* Links */}
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
      </div>
    </nav>
  );
}
