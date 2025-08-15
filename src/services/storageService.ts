import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

export async function downloadTemplateBytes(pathInBucket: string): Promise<Uint8Array> {
  const { data, error } = await supabase.storage
    .from(config.templatesBucket)
    .download(pathInBucket);
  if (error) throw error;
  const arr = new Uint8Array(await data.arrayBuffer());
  return arr;
}

export async function uploadDocument(path: string, bytes: Uint8Array) {
  const { data, error } = await supabase.storage
    .from(config.documentsBucket)
    .upload(path, bytes, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (error) throw error;
  return data;
}

export async function signDocumentUrl(path: string) {
  const { data, error } = await supabase.storage
    .from(config.documentsBucket)
    .createSignedUrl(path, config.signedUrlExpiry);
  if (error) throw error;
  return data;
}
