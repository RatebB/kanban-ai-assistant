import { NextResponse } from "next/server";
import { breakdownResponseSchema } from "@/lib/schemas";

const SYSTEM_PROMPT = `Tu es un assistant qui découpe des tâches de projet en sous-tâches actionnables.

Règles :
- Génère entre 3 et 6 sous-tâches
- Chaque sous-tâche doit être concrète et réalisable (pas de généralités comme "planifier" ou "réfléchir")
- Ordonne les sous-tâches dans un ordre logique d'exécution
- Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après, au format exact :
{"subtasks": [{"title": "...", "description": "..."}]}`;

export async function POST(request: Request) {
  const { taskTitle } = await request.json();

  if (!taskTitle || typeof taskTitle !== "string" || taskTitle.trim().length < 3) {
    return NextResponse.json(
      { error: "Le titre de la tâche est requis (3 caractères minimum)." },
      { status: 400 }
    );
  }

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Tâche à découper : "${taskTitle}"` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      }),
    });

    if (!groqResponse.ok) {
      return NextResponse.json(
        { error: "Le service IA est momentanément indisponible." },
        { status: 502 }
      );
    }

    const data = await groqResponse.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        { error: "Réponse IA vide ou invalide." },
        { status: 502 }
      );
    }

    const parsed = breakdownResponseSchema.safeParse(JSON.parse(rawContent));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Format de réponse IA inattendu." },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed.data);
  } catch (err) {
    console.error("Erreur breakdown IA:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}