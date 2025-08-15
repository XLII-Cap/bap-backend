import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";
import { applicationRouter } from "./routes/applications.js";
import { analyzeRouter } from "./routes/analyze.js";


const app = express();
app.use(express.json());

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowAll = config.allowedOrigins.includes("*");
    if (allowAll || config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

// >>> neue API-Basisroute
app.use("/api/applications", applicationRouter);
app.use("/api/analyze", analyzeRouter);


app.listen(config.port, () => {
  logger.info(`Server läuft auf Port ${config.port} (Mode: ${config.nodeEnv})`);
});
