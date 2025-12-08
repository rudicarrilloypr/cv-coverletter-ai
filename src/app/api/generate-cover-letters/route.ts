import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { cv, jobDescription, count } = await req.json();

    if (!cv || !jobDescription) {
      return NextResponse.json(
        { error: "Missing cv or jobDescription" },
        { status: 400 }
      );
    }

    const n = Math.min(Number(count) || 3, 10);

    const prompt = `
Eres un asistente experto en recursos humanos.

Tarea:
- Toma el siguiente CV del candidato.
- Toma la siguiente descripción de vacante.
- Genera ${n} cartas de presentación distintas, en español neutro profesional.
- Cada carta debe:
  - Estar adaptada a la vacante.
  - Usar tono humano, cercano pero profesional.
  - Tener 3–5 párrafos.
  - No repetir exactamente las mismas frases entre cartas.

Devuelve la respuesta en JSON con esta forma EXACTA:
{
  "letters": ["carta 1...", "carta 2...", "..."]
}

CV:
${cv}

Job Description:
${jobDescription}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.1-mini",
        input: prompt,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", errorText);
      return NextResponse.json(
        { error: "OpenAI request failed" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // data.output[0].content[0].text is typical for Responses API
    const raw = data.output?.[0]?.content?.[0]?.text ?? "{}";
    let parsed: { letters?: string[] } = {};

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse error:", e, raw);
      return NextResponse.json(
        { error: "Failed to parse model output" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      letters: parsed.letters || [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
