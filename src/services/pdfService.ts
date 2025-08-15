import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { downloadTemplateBytes } from "./storageService.js";
import type { Applicant } from "../types.js";

type GenerateOptions = {
  templatePathInBucket: string;
  fieldMapping: Record<string, string>;
  applicant: Applicant;
  measures: string[];
  justificationText: string;
};

// liest einfache Pfade wie "applicant.lastName"
function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

// Umbrechen des Texts (einfach)
function wrapText(text: string, maxCharsPerLine = 95): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > maxCharsPerLine) {
      lines.push(line.trim());
      line = word;
    } else {
      line += " " + word;
    }
  }
  if (line.trim().length) lines.push(line.trim());
  return lines;
}

export async function generateApplicationPdf(opts: GenerateOptions): Promise<Uint8Array> {
  const templateBytes = await downloadTemplateBytes(opts.templatePathInBucket);
  const pdfDoc = await PDFDocument.load(templateBytes);

  const form = pdfDoc.getForm();
  const fields = form.getFields();

  // PDF-Felder befüllen
  if (fields.length > 0) {
    for (const field of fields) {
      const name = field.getName();
      const path = opts.fieldMapping[name];
      if (!path) continue;
      const value = getByPath({ applicant: opts.applicant, measures: opts.measures }, path);
      if (typeof value === "undefined" || value === null) continue;
      try {
        // @ts-ignore
        field.setText(String(value));
      } catch {
        continue;
      }
    }
    try {
      form.flatten(); // Felder festschreiben
    } catch {}
  }

  // Begründung als neue Seite anhängen
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in pt
  const { width } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontSize = 11;
  const margin = 50;
  const maxWidth = width - (margin * 2);

  const lines = wrapText(opts.justificationText, 110);
  let y = 800;
  for (const line of lines) {
    page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
    y -= 15;
    if (y < 60) {
      // neue Seite
      const p = pdfDoc.addPage([595.28, 841.89]);
      y = 800;
    }
  }

  return await pdfDoc.save();
}
