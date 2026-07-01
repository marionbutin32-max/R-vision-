import fs from "fs";
import path from "path";

export async function extraireTextePDF(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid issues with pdf-parse and Next.js
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return data.text;
}

export async function sauvegarderFichier(
  buffer: Buffer,
  nom: string
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const safeName = nom.replace(/[^a-z0-9.-]/gi, "_");
  const filename = `${timestamp}_${safeName}`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, buffer);
  return filename;
}

export function genererID(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
