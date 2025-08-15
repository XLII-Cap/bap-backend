/**
 * OpenAI-Service zur automatisierten Befüllung aller Antragsfelder.
 * Ziel: Aus Freitext + Strukturangaben wird eine vollständige JSON-Struktur erzeugt.
 */

import OpenAI from "openai";
import { config } from "../config.js";

// OpenAI-Client
const client = new OpenAI({
  apiKey: config.openaiApiKey,
});

// Eingabetyp
type AnalyzeInput = {
  notes: string;
  applicant?: Record<string, any>;
  measures?: string[];
};

/**
 * Nutze Freitext + Kontextdaten zur Analyse
 */
export async function analyzeApplicationText(input: AnalyzeInput): Promise<{
  description: string;
  justification: string;
}> {
  const { notes, applicant, measures } = input;

  // Prompt dynamisch aus vorhandenem Input aufbauen
  const context: string[] = [];

  if (applicant) {
    context.push("## Angaben zur Person ##");
    context.push(JSON.stringify(applicant, null, 2));
  }

  if (measures?.length) {
    context.push("## Gewünschte Maßnahmen ##");
    context.push(JSON.stringify(measures));
  }

  context.push("## Freitext des Antragstellers ##");
  context.push(notes);

  const prompt = `
Du bist ein Assistent für Pflegeanträge nach §40 SGB XI. Analysiere die folgenden Angaben und gib eine strukturierte JSON-Antwort zurück.

### ZIELFORMAT ###
{
  "description": "Kurze Beschreibung der geplanten Maßnahme",
  "justification": "Begründung aus Sicht der Pflegeperson oder des Antragstellers"
}

### ANGABEN ###
${context.join("\n\n")}

### JSON-ANTWORT ###
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Du bist ein KI-Assistent für Pflegeanträge nach §40 SGB XI." },
      { role: "user", content: prompt }
    ],
    temperature: 0.4
  });

  const text = completion.choices[0]?.message?.content || "";
  const jsonStart = text.indexOf("{");
  const json = text.slice(jsonStart).trim();

  try {
    return JSON.parse(json);
  } catch (err) {
    console.error("❌ Fehler beim Parsen der KI-Antwort:", err);
    throw new Error("Die Antwort der KI konnte nicht gelesen werden.");
  }
}
