import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type CoverLetterMode = "standard" | "concise" | "storytelling" | "technical";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cv = body.cv as string | undefined;
    const jobDescription = body.jobDescription as string | undefined;
    const countRaw = body.count as number | undefined;
    const modeRaw = body.mode as string | undefined;

    if (!cv || !jobDescription) {
      return Response.json(
        { error: "Falta el CV o la descripción del puesto" },
        { status: 400 }
      );
    }

    const count = Math.min(Math.max(Number(countRaw) || 3, 1), 10);

    const mode: CoverLetterMode =
      modeRaw === "concise" ||
      modeRaw === "storytelling" ||
      modeRaw === "technical"
        ? modeRaw
        : "standard";

    const modeInstructions =
      mode === "concise"
        ? "Haz cada carta muy breve y directa, máximo 3 párrafos, y ve al punto rápidamente."
        : mode === "storytelling"
        ? "Incluye un poco de storytelling: cuenta una breve historia que conecte la experiencia de la persona con las necesidades del puesto."
        : mode === "technical"
        ? "Enfatiza habilidades técnicas, stack tecnológico, métricas y resultados medibles, y palabras clave relevantes para roles de ingeniería o data."
        : "Haz cartas profesionales balanceadas: buen tono humano, estructura clásica, y foco en logros relevantes.";

    const prompt = `
Eres un experto en redacción de cartas de presentación y career coaching.

TAREA:
- Escribe ${count} cartas de presentación diferentes.
- Cada carta debe estar adaptada al CV y a la descripción del puesto.
- Usa un tono profesional, humano y convincente.
- Escribe en el mismo idioma en el que esté la descripción (español/inglés).

MODO SELECCIONADO POR EL USUARIO: "${mode}"

INSTRUCCIONES DE ESTILO PARA ESTE MODO:
${modeInstructions}

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

    return Response.json({ letters });
  } catch (err) {
    console.error("OpenAI error:", err);
    return Response.json({ error: "Error calling OpenAI" }, { status: 500 });
  }
}
