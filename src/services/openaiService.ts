/**
 * OpenAI-Service zur automatisierten Erstellung von Beschreibung und Begründung.
 * Ziel: Aus dem Freitext (notes) werden "description" und "justification" erzeugt.
 */

import OpenAI from "openai";
import { config } from "../config.js";

const client = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Nur Beschreibung und Begründung aus dem Freitext generieren.
 * Alle anderen Felder werden NICHT verändert.
 */
export async function analyzeApplicationText(notes: string): Promise<{
  description: string;
  justification: string;
}> {
  const prompt = `
Du bist ein Assistent für Pflegeanträge (§ 40 SGB XI).
Analysiere den folgenden Freitext und gib eine JSON-Antwort mit den Feldern "description" und "justification" zurück.

Freitext:
${notes}

Erwarte nur dieses Format:

{
  "description": "…",
  "justification": "…"
}
  `.trim();

  const completion = await client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Du bist ein KI-Assistent für Pflegeanträge." },
      { role: "user", content: prompt }
    ],
    temperature: 0.4
  });

  const text = completion.choices[0]?.message?.content || "";
  const jsonStart = text.indexOf("{");
  const json = text.slice(jsonStart).trim();

  try {
    const parsed = JSON.parse(json);
    return {
      description: parsed.description ?? "",
      justification: parsed.justification ?? ""
    };
  } catch (err) {
    console.error("Fehler beim Parsen der KI-Antwort:", err);
    throw new Error("Die Antwort der KI konnte nicht gelesen werden.");
  }
}
