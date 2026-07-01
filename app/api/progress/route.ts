import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { userProgress } from "@/db/schema";
import { calculerSM2, scoreDepuisReponse } from "@/lib/sm2";
import { eq } from "drizzle-orm";
import { genererID } from "@/lib/pdf";

export async function POST(req: NextRequest) {
  await initDb();
  const { questionId, correct, tempsReponse } = await req.json();

  if (!questionId) {
    return NextResponse.json({ error: "questionId requis" }, { status: 400 });
  }

  const [current] = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.questionId, questionId));

  const score = scoreDepuisReponse(correct, tempsReponse);

  const input = current
    ? {
        facilite: current.facilite,
        intervalle: current.intervalle,
        repetitions: current.repetitions,
      }
    : { facilite: 2.5, intervalle: 1, repetitions: 0 };

  const result = calculerSM2(input, score);

  const now = new Date().toISOString();

  if (current) {
    await db
      .update(userProgress)
      .set({
        facilite: result.facilite,
        intervalle: result.intervalle,
        repetitions: result.repetitions,
        prochainRevision: result.prochainRevision.toISOString(),
        derniereRevision: now,
        bonnesReponses: correct
          ? current.bonnesReponses + 1
          : current.bonnesReponses,
        mauvaisesReponses: !correct
          ? current.mauvaisesReponses + 1
          : current.mauvaisesReponses,
        updatedAt: now,
      })
      .where(eq(userProgress.questionId, questionId));
  } else {
    await db.insert(userProgress).values({
      id: genererID(),
      questionId,
      facilite: result.facilite,
      intervalle: result.intervalle,
      repetitions: result.repetitions,
      prochainRevision: result.prochainRevision.toISOString(),
      derniereRevision: now,
      bonnesReponses: correct ? 1 : 0,
      mauvaisesReponses: correct ? 0 : 1,
    });
  }

  return NextResponse.json({
    score,
    prochainRevision: result.prochainRevision,
    intervalle: result.intervalle,
  });
}
