/**
 * Lädt das passende Template für eine Pflegekasse aus insurers.json
 */

import insurers from "../data/insurers.json";

export type TemplateInfo = {
  insurerName: string;
  templatePathInBucket: string;
  fieldMapping: Record<string, string>;
};

// Hilfsfunktion zur Vereinheitlichung (keine Leerzeichen, alles klein)
function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Hauptfunktion: Sucht passendes Template
export async function findTemplateForInsurer(insurerName: string): Promise<TemplateInfo | null> {
  const key = normalize(insurerName);

  return (
    insurers.find(template =>
      normalize(template.insurerName) === key
    ) || null
  );
}
