import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { questions, options, userProgress } from "@/db/schema";
import { eq, lte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  await initDb();
  const { searchParams } = new URL(req.url);
  const chapitreId = searchParams.get("chapitreId");
  const mode = searchParams.get("mode") || "due"; // "due" | "all"

  if (!chapitreId) {
    return NextResponse.json({ error: "chapitreId requis" }, { status: 400 });
  }

  // Fetch questions for this chapter
  const questionsRows = await db
    .select()
    .from(questions)
    .where(eq(questions.chapitreId, chapitreId));

  if (questionsRows.length === 0) {
    return NextResponse.json([]);
  }

  const now = new Date().toISOString();

  // Enrich with options and progress
  const result = [];
  for (const q of questionsRows) {
    const optsRows = await db
      .select()
      .from(options)
      .where(eq(options.questionId, q.id));

    const [progress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.questionId, q.id));

    // In "due" mode, only include questions scheduled for today or overdue
    if (mode === "due" && progress && progress.prochainRevision > now) {
      continue;
    }

    result.push({
      ...q,
      options: optsRows,
      progress: progress || null,
    });
  }

  return NextResponse.json(result);
}
