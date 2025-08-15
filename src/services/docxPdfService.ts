import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import libre from 'libreoffice-convert';
import { downloadTemplateBytes } from './storageService.js';

export async function generatePdfFromDocxTemplate(
  templatePathInBucket: string,
  data: Record<string, any>
): Promise<Buffer> {
  // 1. Word-Datei aus Supabase laden
  const docxBytes = await downloadTemplateBytes(templatePathInBucket);

  // 2. Vorlage mit Daten befüllen
  const zip = new PizZip(docxBytes);
  const doc = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    linebreaks: true,
    paragraphLoop: true,
    nullGetter: () => '',
  });

  doc.render(data);

  const filledDocx = doc.getZip().generate({ type: 'nodebuffer' });

  // 3. DOCX → PDF konvertieren
  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    libre.convert(filledDocx, '.pdf', undefined, (err, done) => {
      if (err) return reject(err);
      resolve(done);
    });
  });

  return pdfBuffer;
}
