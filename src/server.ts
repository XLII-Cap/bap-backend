import express from "express";
import cors from "cors";

// --- Minimaler Express-Server (nur Healthcheck) ---
// Alles ist bewusst klein gehalten; wir erweitern schrittweise.

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
