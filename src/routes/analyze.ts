import { Router } from "express";
import { z } from "zod";
import { analyzeApplicationText } from "../services/openaiService.js";

export const analyzeRouter = Router();

// Schema: nur ein Freitext
const AnalyzeSchema = z.object({
  text: z.string().min(10)
});

analyzeRouter.post("/", async (req, res) => {
  const parsed = AnalyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: "Ungültige Eingabe", details: parsed.error.issues });
  }

  try {
    const structured = await analyzeApplicationText(parsed.data.text);
    return res.json({ ok: true, data: structured });
  } catch (err: any) {
    console.error("Fehler bei Analyse:", err);
    return res.status(500).json({ ok: false, error: "Analyse fehlgeschlagen", message: err.message ?? String(err) });
  }
});
