// src/services/templateService.ts

import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export type TemplateInfo = {
  insurerName: string;
  templatePathInBucket: string; // z. B. "templates/Antrag_TK.docx"
  fieldMapping: Record<string, string>; // wird später genutzt, optional
};

// Supabase initialisieren
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Lädt das passende Template aus insurers.json
 */
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

/**
 * Lädt das Word-Template aus Supabase Storage
 */
export async function loadTemplateFromSupabase(filePath: string): Promise<Buffer> {
  const { data, error } = await supabase.storage
    .from("antraege") // Name deines Buckets
    .download(filePath);

  if (error || !data) {
    throw new Error(`Fehler beim Laden des Templates aus Supabase: ${error?.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Füllt ein DOCX-Template mit den übergebenen Daten und gibt den Buffer zurück
 */
export async function fillTemplateWithData(templatePath: string, data: Record<string, any>): Promise<Buffer> {
  const docxBuffer = await loadTemplateFromSupabase(templatePath);

  const zip = new PizZip(docxBuffer);
  const doc = new Docxtemplater(zip, {
    delimiters: { start: "{{", end: "}}" },
    linebreaks: true,
    paragraphLoop: true,
    nullGetter: () => "",
  });

  doc.render(data);

  return Buffer.from(doc.getZip().generate({ type: "nodebuffer" }));
}
