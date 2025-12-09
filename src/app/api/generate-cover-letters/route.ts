// src/app/api/generate-cover-letters/route.ts
import OpenAI from "openai";
import { auth } from "@/app/auth";           // 👈 usamos tu helper de NextAuth
import { prisma } from "@/app/lib/prisma";   // 👈 Prisma client

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type CoverLetterMode = "standard" | "concise" | "storytelling" | "technical";
type CoverLetterLanguage = "auto" | "spanish" | "english";

export async function POST(req: Request) {
  try {
    // 1) Verificar sesión
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return Response.json(
        { error: "Debes iniciar sesión para generar cartas." },
        { status: 401 }
      );
    }

    const email = session.user.email;

    // 2) Leer body
    const body = await req.json();
    const cv = body.cv as string | undefined;
    const jobDescription = body.jobDescription as string | undefined;
    const countRaw = body.count as number | undefined;
    const modeRaw = body.mode as string | undefined;
    const languageRaw = body.language as string | undefined;
    const userName = body.userName as string | undefined;

    if (!cv || !jobDescription) {
      return Response.json(
        { error: "Falta el CV o la descripción del puesto" },
        { status: 400 }
      );
    }

    // 3) Normalizar parámetros
    const count = Math.min(Math.max(Number(countRaw) || 3, 1), 10);

    const mode: CoverLetterMode =
      modeRaw === "concise" ||
      modeRaw === "storytelling" ||
      modeRaw === "technical"
        ? modeRaw
        : "standard";

    const language: CoverLetterLanguage =
      languageRaw === "spanish" || languageRaw === "english"
        ? languageRaw
        : "auto";

    // 4) Buscar usuario en DB
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json(
        { error: "Usuario no encontrado en la base de datos." },
        { status: 404 }
      );
    }

    // 💰 5) Lógica de créditos
    // Por ahora: 1 crédito por carta generada
    const costPerLetter = 1;
    const totalCost = costPerLetter * count;

    if (user.credits < totalCost) {
      return Response.json(
        {
          error:
            "No tienes créditos suficientes para generar estas cartas. Compra más créditos o reduce la cantidad.",
          currentCredits: user.credits,
          requiredCredits: totalCost,
        },
        { status: 402 } // Payment Required (semánticamente tiene sentido)
      );
    }

    // 6) Instrucciones de modo / idioma / firma
    const modeInstructions =
      mode === "concise"
        ? "Haz cada carta muy breve y directa, máximo 3 párrafos, y ve al punto rápidamente."
        : mode === "storytelling"
        ? "Incluye un poco de storytelling: cuenta una breve historia que conecte la experiencia de la persona con las necesidades del puesto."
        : mode === "technical"
        ? "Enfatiza habilidades técnicas, stack tecnológico, métricas y resultados medibles, y palabras clave relevantes para roles de ingeniería o data."
        : "Haz cartas profesionales balanceadas: buen tono humano, estructura clásica, y foco en logros relevantes.";

    const languageInstructions =
      language === "spanish"
        ? "Todas las cartas deben estar escritas en ESPAÑOL, sin mezclar idiomas."
        : language === "english"
        ? "All cover letters must be written in ENGLISH only, do not mix with Spanish."
        : "Escribe en el idioma principal de la descripción del puesto (español o inglés).";

    const signatureInstructions = userName
      ? `Al final de CADA carta, añade una línea de firma con este nombre EXACTO, sin modificarlo ni inventar otros nombres:
"${userName}"`
      : "No añadas firma con nombre al final; deja que la persona agregue su nombre si lo desea.";

    const prompt = `
Eres un experto en redacción de cartas de presentación y career coaching.

TAREA:
- Escribe ${count} cartas de presentación diferentes.
- Cada carta debe estar adaptada al CV y a la descripción del puesto.
- Usa un tono profesional, humano y convincente.

MODO SELECCIONADO POR EL USUARIO: "${mode}"

INSTRUCCIONES DE ESTILO PARA ESTE MODO:
${modeInstructions}

INSTRUCCIONES DE IDIOMA:
${languageInstructions}

INSTRUCCIONES DE FIRMA:
${signatureInstructions}

FORMATO DE RESPUESTA (MUY IMPORTANTE):
Responde ÚNICAMENTE con un JSON válido con esta forma exacta:

{
  "letters": [
    "carta 1...",
    "carta 2...",
    "carta 3..."
  ]
}

No agregues texto fuera del JSON, ni comentarios, ni explicaciones.

CV:
${cv}

DESCRIPCIÓN DEL PUESTO:
${jobDescription}
    `.trim();

    // 7) Llamar a OpenAI SOLO si hay créditos suficientes
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: 2000,
    });

    const firstOutput = response.output[0] as any;
    const textItem = firstOutput.content.find(
      (c: any) => c.type === "output_text"
    );
    const rawText: string = textItem?.text ?? "";

    let json: unknown;
    try {
      json = JSON.parse(rawText);
    } catch (e) {
      console.error("Error parseando JSON de OpenAI:", rawText);
      return Response.json(
        { error: "La respuesta del modelo no fue JSON válido" },
        { status: 500 }
      );
    }

    const letters =
      typeof json === "object" &&
      json !== null &&
      Array.isArray((json as any).letters)
        ? (json as any).letters
        : [];

    // 8) Descontar créditos SOLO si realmente generamos cartas
    const newCredits = user.credits - totalCost;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: newCredits,
      },
    });

    return Response.json({
      letters,
      remainingCredits: newCredits,
      spentCredits: totalCost,
    });
  } catch (err) {
    console.error("OpenAI / API error:", err);
    return Response.json(
      { error: "Error interno al generar las cartas" },
      { status: 500 }
    );
  }
}
