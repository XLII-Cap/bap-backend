/**
 * Zentrale Konfiguration (liest nur Umgebungsvariablen).
 * Werte werden in Render unter Settings → Environment gesetzt.
 */
export const config = {
  port: Number(process.env.PORT ?? 8080),
  nodeEnv: process.env.NODE_ENV ?? "production",
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "*")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean),
};
