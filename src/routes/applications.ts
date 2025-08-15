import { Router } from "express";
import { z } from "zod";
import { findTemplateForInsurer } from "../services/templateService.js";
import { createJustification } from "../services/openaiService.js";
import type { CreateApplicationRequest } from "../types.js";

export const applicationRouter = Router();

// --- SCHEMAS ---
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
});

// --- ROUTE ---
applicationRouter.post("/generate", async (req, res) => {
  const parsed = CreateApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Ungültige Eingabe",
      details: parsed.error.issues,
    });
  }

  const payload: CreateApplicationRequest = parsed.data;

  try {
    // 1) PDF-Vorlage je nach Kasse suchen
    const template = await findTemplateForInsurer(payload.applicant.insuranceName);
    if (!template) {
      return res.status(404).json({
        ok: false,
        error: `Keine PDF-Vorlage gefunden für '${payload.applicant.insuranceName}'`,
      });
    }

    // 2) Begründungstext generieren
    const justification = await createJustification(payload);

    // 3) JSON-Antwort senden (noch ohne PDF!)
    return res.status(200).json({
      ok: true,
      template: template.templatePathInBucket,
      justification: justification,
    });

  } catch (err) {
    console.error("Fehler beim Generieren:", err);
    return res.status(500).json({
      ok: false,
      error: "Interner Fehler beim Generieren",
    });
  }
});
