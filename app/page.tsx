"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Matiere {
  id: string;
  nom: string;
  couleur: string;
}

const COULEURS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6",
];

export default function Dashboard() {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nom, setNom] = useState("");
  const [couleur, setCouleur] = useState(COULEURS[0]);

  useEffect(() => {
    fetch("/api/init", { method: "POST" }).then(() => {
      fetch("/api/matieres")
        .then((r) => r.json())
        .then((d) => {
          setMatieres(Array.isArray(d) ? d : []);
          setLoading(false);
        });
    });
  }, []);

  async function creerMatiere(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/matieres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, couleur }),
    });
    const m = await res.json();
    setMatieres((prev) => [...prev, m]);
    setNom("");
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Mes matières</h1>
          <p className="text-gray-400 text-sm mt-1">Organise tes révisions par matière</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nouvelle matière
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={creerMatiere}
          className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6"
        >
          <h2 className="font-semibold mb-4">Nouvelle matière</h2>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Nom</label>
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="ex: Anatomie, Biochimie..."
                required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Couleur</label>
              <div className="flex gap-2">
                {COULEURS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCouleur(c)}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: couleur === c ? "white" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Créer
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-white text-sm px-3 py-2"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-gray-500 text-sm">Chargement...</div>
      ) : matieres.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-4xl mb-3">📚</div>
          <p>Aucune matière pour l'instant.</p>
          <p className="text-sm mt-1">Crée ta première matière pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matieres.map((m) => (
            <Link
              key={m.id}
              href={`/matieres/${m.id}`}
              className="group block bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-gray-500 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: m.couleur }}
              >
                {m.nom[0].toUpperCase()}
              </div>
              <div className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                {m.nom}
              </div>
              <div className="text-xs text-gray-500 mt-1">Voir les chapitres →</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
