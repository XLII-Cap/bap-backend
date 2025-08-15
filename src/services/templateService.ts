/**
 * Service zur Auswahl der richtigen PDF-Vorlage je nach Pflegekasse.
 * Für den Anfang arbeiten wir mit einer einfachen Liste im Code.
 * Später kann diese aus Supabase kommen.
 */

export type TemplateInfo = {
  insurerName: string;
  templatePathInBucket: string;
  fieldMapping: Record<string, string>;
};

// Kleine Hilfsfunktion zur Vereinheitlichung
function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Unser Beispiel-Mapping
const templates: TemplateInfo[] = [
  {
    insurerName: "AOK",
    templatePathInBucket: "aok/template.pdf",
    fieldMapping: {
      "Antragsteller_Nachname": "applicant.lastName",
      "Antragsteller_Vorname": "applicant.firstName",
      "Versichertennummer": "applicant.insuranceIdNumber",
      "Pflegegrad": "applicant.careLevel"
    }
  },
  {
    insurerName: "Barmer",
    templatePathInBucket: "barmer/template.pdf",
    fieldMapping: {
      "Name": "applicant.lastName",
      "Vorname": "applicant.firstName",
      "Pflegegrad": "applicant.careLevel"
    }
  }
];

// Hauptfunktion: Suche passende Vorlage
export async function findTemplateForInsurer(insurerName: string): Promise<TemplateInfo | null> {
  const key = normalize(insurerName);
  for (const t of templates) {
    if (normalize(t.insurerName) === key) return t;
  }
  return null;
}
