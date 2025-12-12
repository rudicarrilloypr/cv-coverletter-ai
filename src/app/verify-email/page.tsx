// src/app/verify-email/page.tsx
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string;
    email?: string;
  }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  // 👇 Ahora SI desestructuramos usando await
  const { token, email } = await searchParams;

  let ok = false;
  let message = "";

  if (!token || !email) {
    message = "El enlace de verificación no es válido.";
  } else {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.identifier !== email) {
      message = "El enlace de verificación no es válido o ya fue usado.";
    } else if (record.expires < new Date()) {
      message = "El enlace de verificación ha expirado.";
    } else {
      // Marcar el usuario como verificado
      await prisma.user.update({
        where: { email },
        data: {
          emailVerified: new Date(),
        },
      });

      // Borrar el token para que no se pueda reutilizar
      await prisma.verificationToken.delete({
        where: { token },
      });

      ok = true;
      message = "Tu correo ha sido verificado. Ya puedes iniciar sesión.";
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-lg text-slate-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/60 flex items-center justify-center">
            <span className="text-sm font-bold tracking-wide text-emerald-300">
              CL
            </span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">
              {ok ? "Correo verificado" : "Error al verificar"}
            </h1>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6">{message}</p>

        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-900"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </main>
  );
}
