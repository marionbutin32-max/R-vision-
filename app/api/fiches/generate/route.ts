import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { cours, fiches } from "@/db/schema";
import { genererFiche } from "@/lib/ai";
import { genererID } from "@/lib/pdf";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  await initDb();
  const { coursId } = await req.json();

  if (!coursId) {
    return NextResponse.json({ error: "coursId requis" }, { status: 400 });
  }

  const [coursRow] = await db.select().from(cours).where(eq(cours.id, coursId));
  if (!coursRow) {
    return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
  }

  const { titre, contenu } = await genererFiche(
    coursRow.contenuBrut,
    coursRow.nom
  );

  const id = genererID();
  await db.insert(fiches).values({
    id,
    titre,
    contenu,
    chapitreId: coursRow.chapitreId,
    coursId,
  });

  return NextResponse.json({ id, titre, contenu }, { status: 201 });
}
