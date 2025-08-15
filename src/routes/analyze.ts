import { Router } from "express";
import { z } from "zod";
import { analyzeApplicationText } from "../services/openaiService.js";

export const analyzeRouter = Router();

const AnalyzeSchema = z.object({
  notes: z.string().min(5),
  applicant: z.any().optional(),
  measures: z.array(z.string()).optional()
});

analyzeRouter.post("/", async (req, res) => {
  const parsed = AnalyzeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Ungültige Eingabe",
      details: parsed.error.issues,
    });
  }

  const { notes, applicant, measures } = parsed.data;

  try {
    const suggestion = await analyzeApplicationText({ notes, applicant, measures });

    return res.status(200).json({
      ok: true,
      suggestion,
    });

  } catch (err: any) {
    console.error("Fehler bei analyze:", err);
    return res.status(500).json({
      ok: false,
      error: "Interner Fehler",
      message: err?.message || JSON.stringify(err),
    });
  }
});
