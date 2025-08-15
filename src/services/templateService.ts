/**
 * Lädt das passende Template für eine Pflegekasse aus insurers.json
 * (Laufzeit-Import via fs, um Probleme mit ESM und Render zu vermeiden)
 */

import fs from "fs/promises";
import path from "path";

export type TemplateInfo = {
  insurerName: string;
  templatePathInBucket: string;
  fieldMapping: Record<string, string>;
};

// Hilfsfunktion zur Vereinheitlichung (keine Leerzeichen, alles klein)
function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Hauptfunktion: Sucht passendes Template aus JSON-Datei im Projekt
export async function findTemplateForInsurer(insurerName: string): Promise<TemplateInfo | null> {
  const key = normalize(insurerName);

  try {
    const filePath = path.resolve("src/data/insurers.json");
    const fileContent = await fs.readFile(filePath, "utf-8");
    const templates: TemplateInfo[] = JSON.parse(fileContent);

    return templates.find(template =>
      normalize(template.insurerName) === key
    ) || null;
  } catch (err) {
    console.error("Fehler beim Laden der insurers.json:", err);
    return null;
  }
}
