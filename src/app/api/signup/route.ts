// src/app/api/signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import crypto from "crypto"; // 👈 por claridad, aunque en Node 18+ suele ser global

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    // 1) Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        // credits: 5 // si quieres forzar aquí, si no, usa el default del schema
      },
    });

    // 2) Crear token de verificación
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // 3) Construir URL de verificación
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const verifyUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(
      email
    )}`;

    // 4) Enviar correo con Resend
    try {
      await resend.emails.send({
        from: "CoverLetter AI <onboarding@resend.dev>", // 👈 IMPORTANTE
        to: email,
        subject: "Confirma tu correo en CoverLetter AI",
        html: `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #0f172a;">
            <h2>Hola${name ? ` ${name}` : ""} 👋</h2>
            <p>Gracias por registrarte en <strong>CoverLetter AI</strong>.</p>
            <p>Por favor confirma tu correo haciendo clic en el siguiente botón:</p>
            <p>
              <a href="${verifyUrl}"
                 style="display:inline-block;padding:10px 18px;border-radius:999px;background:#10b981;color:#0f172a;font-weight:600;text-decoration:none;">
                Confirmar correo
              </a>
            </p>
            <p style="font-size:12px;color:#64748b;margin-top:16px;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:
              <br/>
              <span style="word-break:break-all;">${verifyUrl}</span>
            </p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("Error enviando email de verificación:", mailError);
      // El usuario está creado, pero el email falló.
      // Puedes devolver ok: false si quieres obligar a que funcione,
      // de momento lo dejamos logueado.
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Error interno al registrar usuario." },
      { status: 500 }
    );
  }
}
