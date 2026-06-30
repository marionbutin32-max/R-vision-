import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { matieres, chapitres } from "@/db/schema";
import { genererID } from "@/lib/pdf";
import { eq } from "drizzle-orm";

export async function GET() {
  await initDb();
  const rows = await db.select().from(matieres);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await initDb();
  const body = await req.json();
  const id = genererID();
  await db.insert(matieres).values({
    id,
    nom: body.nom,
    couleur: body.couleur || "#6366f1",
  });
  const row = await db.select().from(matieres).where(eq(matieres.id, id));
  return NextResponse.json(row[0], { status: 201 });
}
