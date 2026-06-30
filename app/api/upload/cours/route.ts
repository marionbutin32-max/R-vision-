import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { cours } from "@/db/schema";
import { extraireTextePDF, sauvegarderFichier, genererID } from "@/lib/pdf";

export async function POST(req: NextRequest) {
  await initDb();

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const chapitreId = formData.get("chapitreId") as string;

  if (!file || !chapitreId) {
    return NextResponse.json(
      { error: "Fichier et chapitreId requis" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = await sauvegarderFichier(buffer, file.name);
  const contenuBrut = await extraireTextePDF(buffer);

  const id = genererID();
  await db.insert(cours).values({
    id,
    nom: file.name.replace(/\.pdf$/i, ""),
    filename,
    contenuBrut,
    chapitreId,
  });

  return NextResponse.json({ id, contenuBrut: contenuBrut.slice(0, 200) }, { status: 201 });
}
