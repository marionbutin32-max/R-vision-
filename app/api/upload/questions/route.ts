import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { questions, options, userProgress } from "@/db/schema";
import { extraireTextePDF, genererID } from "@/lib/pdf";
import { extraireQCM } from "@/lib/ai";

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
  const contenu = await extraireTextePDF(buffer);
  const qcms = await extraireQCM(contenu, file.name);

  if (qcms.length === 0) {
    return NextResponse.json(
      { error: "Aucun QCM trouvé dans le document" },
      { status: 422 }
    );
  }

  const inserted: string[] = [];

  for (const qcm of qcms) {
    const questionId = genererID();

    await db.insert(questions).values({
      id: questionId,
      enonce: qcm.enonce,
      explication: qcm.explication,
      source: file.name,
      chapitreId,
    });

    for (const opt of qcm.options) {
      await db.insert(options).values({
        id: genererID(),
        texte: opt.texte,
        estCorrecte: opt.estCorrecte,
        questionId,
      });
    }

    await db.insert(userProgress).values({
      id: genererID(),
      questionId,
    });

    inserted.push(questionId);
  }

  return NextResponse.json(
    { count: inserted.length, questionIds: inserted },
    { status: 201 }
  );
}
