import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type CoverLetterResponse = {
  letters: string[];
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cv = body.cv as string | undefined;
    const jobDescription = body.jobDescription as string | undefined;
    const countRaw = body.count as number | undefined;

    if (!cv || !jobDescription) {
      return Response.json(
        { error: "Falta el CV o la descripción del puesto" },
        { status: 400 }
      );
    }

    // entre 1 y 10 cartas
    const count = Math.min(Math.max(Number(countRaw) || 3, 1), 10);

    const prompt = `
Eres un experto en redacción de cartas de presentación y career coaching.

TAREA:
- Escribe ${count} cartas de presentación diferentes.
- Cada carta debe estar adaptada al CV y a la descripción del puesto.
- Usa un tono profesional, humano y convincente.
- Puedes escribir en el mismo idioma en el que esté la descripción (español/inglés).

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

    // helper del SDK: toda la salida como texto plano
    const rawText = response.output_text ?? "";

    let parsed: CoverLetterResponse;
    try {
      parsed = JSON.parse(rawText) as CoverLetterResponse;
    } catch (e) {
      console.error("Error parseando JSON de OpenAI:", rawText);
      return Response.json(
        { error: "La respuesta del modelo no fue JSON válido" },
        { status: 500 }
      );
    }

    const letters = Array.isArray(parsed.letters) ? parsed.letters : [];

    return Response.json({ letters });
  } catch (err) {
    console.error("OpenAI error:", err);
    return Response.json({ error: "Error calling OpenAI" }, { status: 500 });
  }
}
