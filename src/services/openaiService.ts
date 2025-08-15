/**
 * Service zur späteren Textgenerierung via OpenAI.
 * Jetzt: Platzhalter-Text – die API-Integration kommt im nächsten Schritt.
 */

import { CreateApplicationRequest } from "../types.js";

// Diese Funktion erzeugt später den Begründungstext
export async function createJustification(payload: CreateApplicationRequest): Promise<string> {
  const a = payload.applicant;

  const text = `
Sehr geehrte Damen und Herren,

für die Antragstellerin ${a.firstName} ${a.lastName}, geboren am ${a.dateOfBirth}, 
besteht aufgrund der gesundheitlichen Einschränkungen (${a.impairments ?? "nicht angegeben"}) und des Pflegegrads ${a.careLevel ?? "nicht bekannt"} 
ein Bedarf an einer wohnumfeldverbessernden Maßnahme.

Geplant ist die Maßnahme: ${(payload.measures ?? []).join(", ") || "nicht angegeben"}.

Die häusliche Pflege wird dadurch erleichtert, das Sturzrisiko gesenkt und die Selbstständigkeit gefördert.

Mit freundlichen Grüßen  
Badumbau Profi System
  `.trim();

  return text;
}
