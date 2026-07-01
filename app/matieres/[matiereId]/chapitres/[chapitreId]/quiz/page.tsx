"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Option {
  id: string;
  texte: string;
  estCorrecte: boolean;
}

interface Question {
  id: string;
  enonce: string;
  explication?: string;
  source?: string;
  options: Option[];
  progress: {
    intervalle: number;
    repetitions: number;
    bonnesReponses: number;
    mauvaisesReponses: number;
    prochainRevision: string;
  } | null;
}

type SessionState = "loading" | "ready" | "quiz" | "done" | "empty";

export default function QuizPage() {
  const { matiereId, chapitreId } = useParams<{
    matiereId: string;
    chapitreId: string;
  }>();

  const [state, setState] = useState<SessionState>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allCount, setAllCount] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [sessionResults, setSessionResults] = useState<
    { questionId: string; correct: boolean; intervalle: number }[]
  >([]);
  const startTime = useRef<number>(0);
  const baseBack = `/matieres/${matiereId}/chapitres/${chapitreId}`;

  useEffect(() => {
    Promise.all([
      fetch(`/api/questions?chapitreId=${chapitreId}&mode=due`).then((r) =>
        r.json()
      ),
      fetch(`/api/questions?chapitreId=${chapitreId}&mode=all`).then((r) =>
        r.json()
      ),
    ]).then(([due, all]) => {
      const dueList = Array.isArray(due) ? due : [];
      const allList = Array.isArray(all) ? all : [];
      setAllCount(allList.length);
      if (allList.length === 0) {
        setState("empty");
      } else if (dueList.length === 0) {
        setState("ready");
        setQuestions([]);
      } else {
        setQuestions(dueList);
        setState("ready");
      }
    });
  }, [chapitreId]);

  function startQuiz() {
    setIndex(0);
    setSelected([]);
    setRevealed(false);
    setSessionResults([]);
    startTime.current = Date.now();
    setState("quiz");
  }

  function toggleOption(id: string) {
    if (revealed) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function verifier() {
    if (selected.length === 0) return;
    const q = questions[index];
    const correctIds = q.options
      .filter((o) => o.estCorrecte)
      .map((o) => o.id);
    const isCorrect =
      selected.length === correctIds.length &&
      selected.every((id) => correctIds.includes(id));
    setCorrect(isCorrect);
    setRevealed(true);

    const tempsReponse = Math.round((Date.now() - startTime.current) / 1000);

    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: q.id,
        correct: isCorrect,
        tempsReponse,
      }),
    });
    const data = await res.json();
    setSessionResults((prev) => [
      ...prev,
      { questionId: q.id, correct: isCorrect, intervalle: data.intervalle },
    ]);
  }

  function suivant() {
    if (index + 1 >= questions.length) {
      setState("done");
    } else {
      setIndex((i) => i + 1);
      setSelected([]);
      setRevealed(false);
      startTime.current = Date.now();
    }
  }

  const q = questions[index];
  const bonnes = sessionResults.filter((r) => r.correct).length;

  if (state === "loading") {
    return <div className="text-gray-500">Chargement...</div>;
  }

  if (state === "empty") {
    return (
      <div className="max-w-xl">
        <Link href={baseBack} className="text-gray-500 hover:text-white text-sm">
          ← Retour
        </Link>
        <div className="text-center py-16 text-gray-500 mt-6">
          <div className="text-3xl mb-3">📝</div>
          <p>Aucune question dans ce chapitre.</p>
          <Link
            href={`${baseBack}/upload`}
            className="inline-block mt-4 text-indigo-400 hover:underline text-sm"
          >
            Importer des annales →
          </Link>
        </div>
      </div>
    );
  }

  if (state === "ready") {
    const dueCount = questions.length;
    return (
      <div className="max-w-xl">
        <Link href={baseBack} className="text-gray-500 hover:text-white text-sm">
          ← Retour
        </Link>
        <h1 className="text-2xl font-bold mt-3 mb-6">Quiz</h1>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
          {dueCount === 0 ? (
            <>
              <div className="text-4xl mb-3">✅</div>
              <p className="text-white font-semibold text-lg">
                Toutes les révisions sont à jour !
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {allCount} question(s) au total — aucune révision due aujourd'hui.
              </p>
              <button
                onClick={() => {
                  fetch(
                    `/api/questions?chapitreId=${chapitreId}&mode=all`
                  )
                    .then((r) => r.json())
                    .then((d) => {
                      setQuestions(Array.isArray(d) ? d : []);
                      startQuiz();
                    });
                }}
                className="mt-5 bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
              >
                Réviser quand même toutes les questions
              </button>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">🧠</div>
              <p className="text-white font-semibold text-lg">
                {dueCount} question{dueCount > 1 ? "s" : ""} à réviser
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {allCount} question(s) au total dans ce chapitre
              </p>
              <button
                onClick={startQuiz}
                className="mt-5 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Commencer la session
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (state === "done") {
    const total = sessionResults.length;
    const pct = total > 0 ? Math.round((bonnes / total) * 100) : 0;
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold mb-6">Session terminée</h1>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center mb-5">
          <div className="text-5xl font-bold text-white mb-2">{pct}%</div>
          <div className="text-gray-400 text-sm">
            {bonnes} / {total} correcte{bonnes > 1 ? "s" : ""}
          </div>
          <div
            className="mt-4 h-2 rounded-full bg-gray-700 overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor:
                  pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444",
              }}
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {sessionResults.map((r, i) => {
            const question = questions.find((q) => q.id === r.questionId);
            return (
              <div
                key={r.questionId}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                  r.correct
                    ? "bg-emerald-900/30 border border-emerald-800"
                    : "bg-red-900/30 border border-red-800"
                }`}
              >
                <span>{r.correct ? "✅" : "❌"}</span>
                <span className="flex-1 text-gray-300 truncate">
                  {question?.enonce.slice(0, 80)}...
                </span>
                <span className="text-xs text-gray-500 shrink-0">
                  J+{r.intervalle}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={startQuiz}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-medium text-sm"
          >
            Recommencer
          </button>
          <Link
            href={baseBack}
            className="flex-1 text-center bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg font-medium text-sm"
          >
            Retour au chapitre
          </Link>
        </div>
      </div>
    );
  }

  // Quiz state
  if (!q) return null;

  const multipleCorrectes = q.options.filter((o) => o.estCorrecte).length > 1;

  return (
    <div className="max-w-2xl">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 bg-gray-800 rounded-full h-1.5">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 shrink-0">
          {index + 1} / {questions.length}
        </span>
      </div>

      {q.source && (
        <div className="text-xs text-gray-600 mb-3">Source : {q.source}</div>
      )}

      {/* Énoncé */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-4">
        <p className="text-white text-base leading-relaxed">{q.enonce}</p>
        {multipleCorrectes && (
          <p className="text-xs text-indigo-400 mt-2">
            Plusieurs réponses possibles
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2 mb-5">
        {q.options.map((opt, i) => {
          const isSelected = selected.includes(opt.id);
          const showCorrect = revealed && opt.estCorrecte;
          const showWrong = revealed && isSelected && !opt.estCorrecte;

          let cls =
            "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all text-sm ";
          if (!revealed) {
            cls += isSelected
              ? "border-indigo-500 bg-indigo-900/30 text-white"
              : "border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500";
          } else if (showCorrect) {
            cls += "border-emerald-500 bg-emerald-900/30 text-white";
          } else if (showWrong) {
            cls += "border-red-500 bg-red-900/30 text-red-300";
          } else {
            cls += "border-gray-700 bg-gray-900 text-gray-500";
          }

          return (
            <div
              key={opt.id}
              onClick={() => toggleOption(opt.id)}
              className={cls}
            >
              <span className="shrink-0 w-6 h-6 rounded border border-current flex items-center justify-center text-xs font-bold">
                {revealed
                  ? showCorrect
                    ? "✓"
                    : showWrong
                    ? "✗"
                    : String.fromCharCode(65 + i)
                  : isSelected
                  ? "●"
                  : String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt.texte}</span>
            </div>
          );
        })}
      </div>

      {/* Explication */}
      {revealed && q.explication && (
        <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 mb-4 text-sm text-blue-200">
          <span className="font-semibold text-blue-300">Explication : </span>
          {q.explication}
        </div>
      )}

      {/* Résultat */}
      {revealed && (
        <div
          className={`p-3 rounded-lg text-sm font-medium mb-4 ${
            correct
              ? "bg-emerald-900/40 text-emerald-300"
              : "bg-red-900/40 text-red-300"
          }`}
        >
          {correct ? "✅ Bonne réponse !" : "❌ Mauvaise réponse"}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!revealed ? (
          <button
            onClick={verifier}
            disabled={selected.length === 0}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Vérifier
          </button>
        ) : (
          <button
            onClick={suivant}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg font-medium text-sm"
          >
            {index + 1 >= questions.length ? "Voir le résultat" : "Question suivante →"}
          </button>
        )}
      </div>
    </div>
  );
}
