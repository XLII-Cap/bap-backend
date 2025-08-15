import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";

/**
 * Minimaler Express-Server mit CORS-Whitelist.
 * Healthcheck bleibt auf /health.
 * CORS erlaubt nur definierte Ursprünge (oder "*" – NICHT für Produktion empfohlen).
 */

const app = express();
app.use(express.json());

app.use(cors({
  origin(origin, callback) {
    // Server-zu-Server oder direkte Aufrufe ohne Origin erlauben
    if (!origin) return callback(null, true);

    const allowAll = config.allowedOrigins.includes("*");
    if (allowAll || config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

// Healthcheck (von Render regelmäßig abgefragt)
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

app.listen(config.port, () => {
  logger.info(`Server läuft auf Port ${config.port} (Mode: ${config.nodeEnv})`);
});
