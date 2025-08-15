
/**
 * OpenAI-Service zur automatisierten Befüllung aller Antragsfelder.
 * Ziel: Aus einem Freitext wird ein vollständiger JSON-Datensatz erzeugt,
 * der in ein PDF-Formular übertragen werden kann.
 */

import OpenAI from "openai";
import { config } from "../config.js";

const client = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Aus Freitext alle relevanten Antrag-Felder generieren lassen.
 */
export async function analyzeApplicationText(userText: string): Promise<any> {
  const prompt = `
Du bist ein Assistent für Pflegeanträge. Bitte analysiere folgenden Text und gib eine strukturierte JSON-Antwort zurück.

### BEISPIELFORMAT ###
{
  "applicant": {
    "firstName": "Anna",
    "lastName": "Muster",
    "dateOfBirth": "1945-03-12",
    "street": "Beispielweg 1",
    "postalCode": "40210",
    "city": "Düsseldorf",
    "insuranceName": "AOK PLUS",
    "insuranceIdNumber": "AOK12345678",
    "careLevel": 3
  },
  "description": "Die Badewanne soll durch eine bodengleiche Dusche ersetzt werden.",
  "justification": "Aufgrund starker Mobilitätseinschränkungen ist die selbstständige Nutzung des Bades nicht mehr möglich...",
  "measures": ["Wanne-zu-Dusche", "Haltegriffe"]
}

### NUTZERTEXT ###
${userText}

### JSON-ANTWORT ###
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Du bist ein KI-Assistent für Pflegeanträge (§ 40 SGB XI)." },
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
    console.error("Fehler beim Parsen der KI-Antwort:", err);
    throw new Error("Die Antwort der KI konnte nicht gelesen werden.");
  }
}
