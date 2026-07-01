import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { chapitres } from "@/db/schema";
import { genererID } from "@/lib/pdf";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  await initDb();
  const { searchParams } = new URL(req.url);
  const matiereId = searchParams.get("matiereId");

  if (matiereId) {
    const rows = await db
      .select()
      .from(chapitres)
      .where(eq(chapitres.matiereId, matiereId));
    return NextResponse.json(rows);
  }

  const rows = await db.select().from(chapitres);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await initDb();
  const body = await req.json();
  const id = genererID();
  await db.insert(chapitres).values({
    id,
    nom: body.nom,
    matiereId: body.matiereId,
  });
  const row = await db
    .select()
    .from(chapitres)
    .where(eq(chapitres.id, id));
  return NextResponse.json(row[0], { status: 201 });
}
