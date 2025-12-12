"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUiLanguage, UiLanguage } from "../ui-language";

const SIGNUP_TEXTS: Record<
  UiLanguage,
  {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    button: string;
    buttonLoading: string;
    already: string;
    goLogin: string;
    genericError: string;
    mismatchError: string;
    tooShortError: string;
  }
> = {
  es: {
    title: "Crear cuenta",
    subtitle:
      "Regístrate para empezar a generar cartas de presentación con IA.",
    nameLabel: "Nombre",
    namePlaceholder: "Tu nombre (opcional)",
    emailLabel: "Email",
    emailPlaceholder: "tucorreo@ejemplo.com",
    passwordLabel: "Contraseña",
    passwordPlaceholder: "Mínimo 6 caracteres",
    confirmPasswordLabel: "Confirmar contraseña",
    confirmPasswordPlaceholder: "Vuelve a escribir tu contraseña",
    button: "Crear cuenta",
    buttonLoading: "Creando cuenta...",
    already: "¿Ya tienes cuenta?",
    goLogin: "Inicia sesión",
    genericError: "No se pudo crear la cuenta.",
    mismatchError: "Las contraseñas no coinciden.",
    tooShortError: "La contraseña debe tener al menos 6 caracteres.",
  },
  en: {
    title: "Create account",
    subtitle: "Sign up to start generating AI-powered cover letters.",
    nameLabel: "Name",
    namePlaceholder: "Your name (optional)",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 6 characters",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Type your password again",
    button: "Create account",
    buttonLoading: "Creating account...",
    already: "Already have an account?",
    goLogin: "Log in",
    genericError: "Could not create the account.",
    mismatchError: "Passwords do not match.",
    tooShortError: "Password must be at least 6 characters long.",
  },
};

export default function SignupPage() {
  const router = useRouter();
  const { uiLanguage, setUiLanguage } = useUiLanguage();
  const t = SIGNUP_TEXTS[uiLanguage];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validaciones en cliente
    if (password.length < 6) {
      setError(t.tooShortError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.mismatchError);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          (data && typeof data.error === "string" && data.error) ||
            t.genericError
        );
      }

      // Registro OK → mandar al login
      router.push("/login");
    } catch (err: any) {
      setError(err?.message ?? t.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex justify-center items-center px-4 bg-slate-950">
      <div className="w-full max-w-md">
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-lg">
          {/* Header con logo + switch idioma */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/60 flex items-center justify-center">
                <span className="text-sm font-bold tracking-wide text-emerald-300">
                  CL
                </span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
                  {t.title}
                </h1>
                <p className="text-xs text-slate-400">{t.subtitle}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 text-[11px]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setUiLanguage("es")}
                  className={`px-2 py-1 rounded-full border ${
                    uiLanguage === "es"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      : "border-slate-700 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => setUiLanguage("en")}
                  className={`px-2 py-1 rounded-full border ${
                    uiLanguage === "en"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      : "border-slate-700 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.nameLabel}
              </label>
              <input
                type="text"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.emailLabel}
              </label>
              <input
                type="email"
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.passwordLabel}
              </label>
              <input
                type="password"
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.confirmPasswordLabel}
              </label>
              <input
                type="password"
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.confirmPasswordPlaceholder}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? t.buttonLoading : t.button}
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-400 text-center">
            {t.already}{" "}
            <Link
              href="/login"
              className="text-emerald-400 hover:underline"
            >
              {t.goLogin}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
