"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Matiere {
  id: string;
  nom: string;
  couleur: string;
}

interface Chapitre {
  id: string;
  nom: string;
  matiereId: string;
}

export default function MatierePage() {
  const { matiereId } = useParams<{ matiereId: string }>();
  const [matiere, setMatiere] = useState<Matiere | null>(null);
  const [chapitres, setChapitres] = useState<Chapitre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nom, setNom] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/matieres").then((r) => r.json()),
      fetch(`/api/chapitres?matiereId=${matiereId}`).then((r) => r.json()),
    ]).then(([mats, chaps]) => {
      const m = Array.isArray(mats) ? mats.find((x: Matiere) => x.id === matiereId) : null;
      setMatiere(m || null);
      setChapitres(Array.isArray(chaps) ? chaps : []);
      setLoading(false);
    });
  }, [matiereId]);

  async function creerChapitre(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/chapitres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, matiereId }),
    });
    const c = await res.json();
    setChapitres((prev) => [...prev, c]);
    setNom("");
    setShowForm(false);
  }

  if (loading) return <div className="text-gray-500">Chargement...</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-gray-500 hover:text-white text-sm">
          ← Matières
        </Link>
        <div className="flex items-center gap-3 mt-3">
          {matiere && (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: matiere.couleur }}
            >
              {matiere.nom[0].toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold">{matiere?.nom || "Matière"}</h1>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-gray-300 font-medium">Chapitres</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nouveau chapitre
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={creerChapitre}
          className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-5 flex gap-3 items-end"
        >
          <div className="flex-1">
            <label className="text-xs text-gray-400 block mb-1">Nom du chapitre</label>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex: Système cardiovasculaire"
              required
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Créer
          </button>
          <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-3 py-2">
            Annuler
          </button>
        </form>
      )}

      {chapitres.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-3xl mb-3">📖</div>
          <p>Aucun chapitre. Crée le premier pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapitres.map((c, i) => (
            <Link
              key={c.id}
              href={`/matieres/${matiereId}/chapitres/${c.id}`}
              className="flex items-center gap-4 bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-gray-500 transition-colors group"
            >
              <span className="text-gray-500 text-sm font-mono w-6">{i + 1}</span>
              <div className="flex-1 font-medium text-white group-hover:text-indigo-300 transition-colors">
                {c.nom}
              </div>
              <span className="text-gray-600 text-sm">Ouvrir →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
