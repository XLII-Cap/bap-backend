import { Router } from "express";
import { z } from "zod";
import { findTemplateForInsurer } from "../services/templateService.js";
import { analyzeApplicationText } from "../services/openaiService.js";
import { generateApplicationPdf } from "../services/pdfService.js";
import { uploadDocument, signDocumentUrl } from "../services/storageService.js";
import type { CreateApplicationRequest } from "../types.js";

export const applicationRouter = Router();

// --- Zod Validierung ---
const ApplicantSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().min(4),
  street: z.string().min(1),
  postalCode: z.string().min(3),
  city: z.string().min(1),
  insuranceName: z.string().min(1),
  insuranceIdNumber: z.string().optional(),
  careLevel: z.number().int().min(1).max(5).optional(),
  impairments: z.string().optional(),
  representative: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    street: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }).optional().nullable(),
});

const CreateApplicationSchema = z.object({
  applicant: ApplicantSchema,
  measures: z.array(z.string()).optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
  justification: z.string().optional()
});

// --- Hauptfunktion ---
applicationRouter.post("/generate", async (req, res) => {
  console.log("🔍 Eingehender Request-Body:", req.body);

  const parsed = CreateApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Ungültige Eingabe",
      details: parsed.error.issues,
    });
  }

  const input = parsed.data;

  try {
    // 1. Mindestvoraussetzungen prüfen
    if (!input.notes || !input.applicant?.insuranceName) {
      return res.status(400).json({
        ok: false,
        error: "Erforderliche Felder fehlen: 'notes' oder 'applicant.insuranceName'",
      });
    }

    // 2. KI befragen (mit allen vorhandenen Feldern)
    const aiSuggestion = await analyzeApplicationText({
      notes: input.notes,
      applicant: input.applicant,
      measures: input.measures ?? []
    });

    // 3. PDF-Vorlage anhand Krankenkasse
    const template = await findTemplateForInsurer(input.applicant.insuranceName);
    if (!template) {
      return res.status(404).json({
        ok: false,
        error: `Keine Vorlage für Kasse '${input.applicant.insuranceName}' gefunden.`,
      });
    }

    // 4. PDF erzeugen
    const pdfBytes = await generateApplicationPdf({
      templatePathInBucket: template.templatePathInBucket,
      fieldMapping: template.fieldMapping,
      applicant: input.applicant,
      measures: input.measures || [],
      justificationText: aiSuggestion.justification || "",
    });

    // 5. PDF speichern
    const fileName = `applications/${Date.now()}_${input.applicant.lastName}_${input.applicant.firstName}.pdf`;
    const { path } = await uploadDocument(fileName, pdfBytes);

    // 6. Signierte URL generieren
    const { signedUrl } = await signDocumentUrl(path);

    // 7. Antwort
    return res.status(200).json({
      ok: true,
      file: {
        path,
        url: signedUrl,
      },
      meta: {
        templateUsed: template.insurerName,
        extractedData: {
          ...input,
          description: aiSuggestion.description,
          justification: aiSuggestion.justification,
        },
      },
    });

  } catch (err: any) {
    console.error("Fehler bei Antragserzeugung:", err);
    return res.status(500).json({
      ok: false,
      error: "Interner Fehler",
      message: err?.message || JSON.stringify(err) || "Unbekannter Fehler",
    });
  }
});
