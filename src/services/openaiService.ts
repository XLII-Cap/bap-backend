/**
 * OpenAI-Service zur automatisierten Erzeugung von Beschreibung & Begründung.
 */

import OpenAI from "openai";
import { config } from "../config.js";

// OpenAI initialisieren
const client = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Nutzt den gesamten Antrag (nicht nur notes), um Beschreibung & Begründung zu generieren.
 */
export async function analyzeApplicationText(userText: string, contextData?: any): Promise<{ description: string; justification: string }> {
  const contextString = contextData
    ? `

### BISHER BEKANNTE FELDER ###
${JSON.stringify(contextData, null, 2)}`
    : "";

  const prompt = `
Du bist ein Assistent für Pflegeanträge gemäß §40 SGB XI.

Deine Aufgabe:
- Lies den folgenden Nutzereingabetext und die optionalen Kontextdaten.
- Generiere ZWEI Dinge:
  1. Eine **Beschreibung der beantragten Maßnahme**
  2. Eine **Begründung**, warum diese Maßnahme medizinisch / pflegerisch notwendig ist.

Antworte NUR im folgenden JSON-Format:

{
  "description": "...",
  "justification": "..."
}

### NUTZERTEXT ###
${userText}
${contextString}

### JSON-ANTWORT ###
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Du bist ein KI-Assistent für Pflegeanträge." },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
  });

  const text = completion.choices[0]?.message?.content || "";
  const jsonStart = text.indexOf("{");
  const json = text.slice(jsonStart).trim();

  try {
    const result = JSON.parse(json);
    return {
      description: result.description || "",
      justification: result.justification || "",
    };
  } catch (err) {
    console.error("❌ Fehler beim Parsen der KI-Antwort:", err);
    console.error("❌ Ursprüngliche Antwort:", text);
    throw new Error("Die Antwort der KI konnte nicht gelesen werden.");
  }
}
