import { Router } from "express";
import { z } from "zod";

// Router-Instanz für alle "applications"-Routen
export const applicationRouter = Router();

// Zod-Schema: Basisdaten des Antragstellers
const ApplicantSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().min(4), // YYYY-MM-DD (vereinfachte Prüfung)
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

// Zod-Schema: Antrags-Request
const CreateApplicationSchema = z.object({
  applicant: ApplicantSchema,
  measures: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// POST /api/applications/generate (Stub)
applicationRouter.post("/generate", (req, res) => {
  const parsed = CreateApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Ungültige Eingabe",
      details: parsed.error.issues,
    });
  }

  // TODO: In den nächsten Schritten implementieren wir:
  // 1) richtige PDF-Vorlage nach Kasse finden
  // 2) Begründung via OpenAI erzeugen
  // 3) PDF ausfüllen + Begründung anhängen
  // 4) Upload nach Supabase Storage + signierte URL zurückgeben

  return res.status(501).json({
    ok: false,
    message: "Noch nicht implementiert – Antragsgenerierung folgt in den nächsten Schritten."
  });
});
