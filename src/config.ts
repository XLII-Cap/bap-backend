/**
 * Zentrale Konfigurationsdatei für das Backend.
 * 
 * Alle Werte stammen aus den Umgebungsvariablen (Render → Settings → Environment).
 * Diese Datei sorgt dafür, dass die Konfiguration an einer Stelle zentral gepflegt wird.
 */

export const config = {
  // Port, auf dem der Express-Server laufen soll (Render erwartet 8080 oder Umgebungswert)
  port: Number(process.env.PORT ?? 8080),

  // Node.js-Umgebungsmodus (z. B. 'production', 'development')
  nodeEnv: process.env.NODE_ENV ?? "production",

  // CORS: erlaubte Ursprünge als Liste (z. B. https://example.de, https://admin.example.de)
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "*")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean),

  // === Supabase-Konfiguration ===

  // URL deines Supabase-Projekts (z. B. https://xyzcompany.supabase.co)
  supabaseUrl: process.env.SUPABASE_URL || "",

  // Supabase Service Role Key (wichtig: nur im Backend verwenden, nie im Frontend!)
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // Bucket, in dem die PDF-Vorlagen (AOK etc.) liegen
  templatesBucket: process.env.SUPABASE_TEMPLATES_BUCKET || "pflegemittelantraege",

  // Bucket für die generierten fertigen PDFs
  documentsBucket: process.env.SUPABASE_DOCUMENTS_BUCKET || "generated-documents",

  // Gültigkeitsdauer von signierten Supabase-URLs (in Sekunden)
  signedUrlExpiry: parseInt(process.env.SUPABASE_SIGNED_URL_EXPIRY || "604800", 10), // 7 Tage

  // === OpenAI-Konfiguration ===

  // OpenAI API-Key (wird später für GPT-basierte Begründung verwendet)
  openaiApiKey: process.env.OPENAI_API_KEY || "",
};
