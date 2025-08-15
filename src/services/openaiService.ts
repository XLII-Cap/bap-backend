/**
 * OpenAI-Service zur automatisierten Befüllung aller Antragsfelder.
 * Ziel: Aus Nutzerdaten wird eine strukturierte JSON-Antwort erzeugt.
 */

import OpenAI from "openai";
import { config } from "../config.js";

const client = new OpenAI({
  apiKey: config.openaiApiKey,
});

// Neuer Typ: Eingabeformat für die Analyse
type AnalyzeInput = {
  notes: string;
  applicant?: any;
  measures?: string[];
};

/**
 * Analyse von Notizen, ergänzt um applicant & measures
 */
export async function analyzeApplicationText(input: AnalyzeInput): Promise<any> {
  const { notes, applicant, measures } = input;

  const prompt = `
Du bist ein Assistent für Pflegeanträge. Analysiere die folgenden Angaben und gib eine strukturierte JSON-Antwort zurück.

### BEISPIELFORMAT ###
{
  "description": "Die Badewanne soll durch eine bodengleiche Dusche ersetzt werden.",
  "justification": "Aufgrund starker Mobilitätseinschränkungen ist die selbstständige Nutzung des Bades nicht mehr möglich..."
}

### NUTZEREINGABEN ###
Pflegegrad: ${applicant?.careLevel || "nicht angegeben"}
Geburtsdatum: ${applicant?.dateOfBirth || "nicht angegeben"}
Versicherung: ${applicant?.insuranceName || "nicht angegeben"}
Maßnahmen: ${(measures || []).join(", ") || "nicht angegeben"}
Freitext: ${notes}

### JSON-ANTWORT ###
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Du bist ein KI-Assistent für Pflegeanträge nach § 40 SGB XI." },
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
