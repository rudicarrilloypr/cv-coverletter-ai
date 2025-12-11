// src/app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUiLanguage, UiLanguage } from "../ui-language";

const LOGIN_TEXTS: Record<
  UiLanguage,
  {
    title: string;
    subtitle: string;
    emailLabel: string;
    passwordLabel: string;
    submit: string;
    registering: string;
    noAccount: string;
    goSignup: string;
    errorGeneric: string;
  }
> = {
  es: {
    title: "Iniciar sesión",
    subtitle: "Accede a tu cuenta para generar y administrar tus cartas.",
    emailLabel: "Email",
    passwordLabel: "Contraseña",
    submit: "Entrar",
    registering: "Entrando...",
    noAccount: "¿Aún no tienes cuenta?",
    goSignup: "Crear cuenta",
    errorGeneric: "Credenciales inválidas o error al iniciar sesión.",
  },
  en: {
    title: "Log in",
    subtitle: "Access your account to generate and manage your cover letters.",
    emailLabel: "Email",
    passwordLabel: "Password",
    submit: "Log in",
    registering: "Logging in...",
    noAccount: "Don't have an account?",
    goSignup: "Sign up",
    errorGeneric: "Invalid credentials or login error.",
  },
};

export default function LoginPage() {
  const { uiLanguage } = useUiLanguage();
  const t = LOGIN_TEXTS[uiLanguage];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/generate";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setSubmitting(false);

    if (!res || res.error) {
      setError(t.errorGeneric);
      return;
    }

    // login ok → redirigir
    router.push(res.url || callbackUrl);
  }

  return (
    <main className="min-h-screen flex justify-center items-center px-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">
          {t.title}
        </h1>
        <p className="text-sm text-slate-300 mb-6">{t.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 font-medium">
              {t.emailLabel}
            </label>
            <input
              type="email"
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">
              {t.passwordLabel}
            </label>
            <input
              type="password"
              required
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? t.registering : t.submit}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          {t.noAccount}{" "}
          <Link
            href="/signup"
            className="font-semibold text-emerald-400 hover:underline"
          >
            {t.goSignup}
          </Link>
        </p>
      </div>
    </main>
  );
}
