/**
 * OpenAI-Service zur automatisierten Befüllung aller Antragsfelder.
 * Ziel: Aus strukturierten Angaben wird eine plausible Beschreibung & Begründung erzeugt.
 */

import OpenAI from "openai";
import { config } from "../config.js";

const client = new OpenAI({
  apiKey: config.openaiApiKey,
});

// 🔷 Eingabestruktur
export type AnalyzeInput = {
  notes: string;
  applicant: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    street: string;
    postalCode: string;
    city: string;
    insuranceName: string;
    insuranceIdNumber?: string;
    careLevel?: number;
    impairments?: string;
  };
  measures: string[];
};

// 🔶 Hauptfunktion: KI generiert Beschreibung + Begründung
export async function analyzeApplicationText(input: AnalyzeInput): Promise<{
  description: string;
  justification: string;
}> {
  const { notes, applicant, measures } = input;

  const prompt = `
Du bist ein Assistent für Pflegekassen-Anträge. Deine Aufgabe ist es, eine sachliche **Beschreibung der Umbaumaßnahme** sowie eine überzeugende **Begründung** zu formulieren.

Die **Begründung** soll folgende Aspekte berücksichtigen:

1. Die beantragten Umbaumaßnahmen: ${measures.join(", ")}
2. Den Pflegegrad der Antragstellerin: ${applicant.careLevel ?? "nicht angegeben"}
3. Die gesundheitlichen Einschränkungen: ${applicant.impairments ?? "nicht angegeben"}
4. Das Geburtsdatum: ${applicant.dateOfBirth} (Alter: ${getAge(applicant.dateOfBirth)} Jahre)

### Wichtig:
- Die Beschreibung soll den Umbau knapp beschreiben: Was soll gemacht werden?
- Die Begründung soll die Notwendigkeit des Umbaus sachlich und plausibel erklären.
- Die Begründung soll **zwischen ¾ und einer DIN-A4-Seite lang** sein.

### Freitext der Antragstellerin:
"${notes}"

### Gib deine Antwort ausschließlich im folgenden JSON-Format zurück:
{
  "description": "...",
  "justification": "..."
}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Du bist ein KI-Assistent für Pflegeanträge gemäß §40 SGB XI." },
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

// 🔽 Altersberechnung
function getAge(dateString: string): number {
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

