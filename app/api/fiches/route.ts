import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { fiches } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  await initDb();
  const { searchParams } = new URL(req.url);
  const chapitreId = searchParams.get("chapitreId");

  if (!chapitreId) {
    return NextResponse.json({ error: "chapitreId requis" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(fiches)
    .where(eq(fiches.chapitreId, chapitreId));

  return NextResponse.json(rows);
}
