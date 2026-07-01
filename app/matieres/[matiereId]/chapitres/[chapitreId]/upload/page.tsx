"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Mode = "cours" | "questions";

export default function UploadPage() {
  const { matiereId, chapitreId } = useParams<{
    matiereId: string;
    chapitreId: string;
  }>();

  const [mode, setMode] = useState<Mode>("cours");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "generating" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [generatedId, setGeneratedId] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("chapitreId", chapitreId as string);

    try {
      if (mode === "cours") {
        const res = await fetch("/api/upload/cours", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur upload");

        setStatus("generating");
        setMessage("Génération de la fiche en cours...");

        const genRes = await fetch("/api/fiches/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coursId: data.id }),
        });
        const gen = await genRes.json();
        if (!genRes.ok) throw new Error(gen.error || "Erreur génération");

        setGeneratedId(gen.id);
        setStatus("success");
        setMessage(`Fiche "${gen.titre}" générée avec succès !`);
      } else {
        const res = await fetch("/api/upload/questions", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur upload");

        setStatus("success");
        setMessage(`${data.count} question(s) importée(s) avec succès !`);
      }
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  const baseBack = `/matieres/${matiereId}/chapitres/${chapitreId}`;

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href={baseBack} className="text-gray-500 hover:text-white text-sm">
          ← Retour au chapitre
        </Link>
        <h1 className="text-2xl font-bold mt-3">Uploader un document</h1>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 mb-6 bg-gray-900 border border-gray-700 rounded-xl p-1">
        {(["cours", "questions"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setStatus("idle");
              setMessage("");
              setFile(null);
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {m === "cours" ? "📘 Cours PDF" : "📝 Annales (QCM)"}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <p className="text-sm text-gray-400 mb-5">
          {mode === "cours"
            ? "Importe un PDF de cours. R-vision extraira le texte et générera automatiquement une fiche de révision structurée."
            : "Importe un PDF d'annales. R-vision extraira tous les QCM et les ajoutera à ta banque de questions."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              Fichier PDF
            </label>
            <div
              className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              {file ? (
                <div>
                  <div className="text-2xl mb-1">📄</div>
                  <div className="text-white text-sm font-medium">{file.name}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {(file.size / 1024).toFixed(0)} Ko
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">⬆️</div>
                  <div className="text-gray-400 text-sm">
                    Clique ou glisse un fichier PDF
                  </div>
                </div>
              )}
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setStatus("idle");
                  setMessage("");
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || status === "uploading" || status === "generating"}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            {status === "uploading"
              ? "Upload en cours..."
              : status === "generating"
              ? "Génération de la fiche..."
              : mode === "cours"
              ? "Uploader et générer la fiche"
              : "Uploader et extraire les QCM"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              status === "success"
                ? "bg-emerald-900/40 border border-emerald-700 text-emerald-300"
                : status === "error"
                ? "bg-red-900/40 border border-red-700 text-red-300"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            {message}
            {status === "success" && mode === "cours" && generatedId && (
              <div className="mt-2">
                <Link
                  href={`${baseBack}/fiches`}
                  className="text-indigo-400 hover:underline font-medium"
                >
                  Voir la fiche →
                </Link>
              </div>
            )}
            {status === "success" && mode === "questions" && (
              <div className="mt-2">
                <Link
                  href={`${baseBack}/quiz`}
                  className="text-indigo-400 hover:underline font-medium"
                >
                  Faire le quiz →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
