"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function ChapitrePage() {
  const { matiereId, chapitreId } = useParams<{
    matiereId: string;
    chapitreId: string;
  }>();

  const sections = [
    {
      href: `upload`,
      icon: "⬆️",
      titre: "Uploader un cours",
      description: "Importe un PDF de cours pour générer une fiche ou ajouter des QCM",
      couleur: "border-blue-700 hover:border-blue-500",
      badge: null,
    },
    {
      href: `fiches`,
      icon: "📄",
      titre: "Fiches de révision",
      description: "Consulte les fiches générées depuis tes cours",
      couleur: "border-emerald-700 hover:border-emerald-500",
      badge: null,
    },
    {
      href: `quiz`,
      icon: "🧠",
      titre: "Quiz & SM-2",
      description: "Réponds aux QCM planifiés par l'algorithme de répétition espacée",
      couleur: "border-indigo-700 hover:border-indigo-500",
      badge: "Révisions du jour",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/matieres/${matiereId}`}
          className="text-gray-500 hover:text-white text-sm"
        >
          ← Retour aux chapitres
        </Link>
        <h1 className="text-2xl font-bold mt-3">Chapitre</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={`/matieres/${matiereId}/chapitres/${chapitreId}/${s.href}`}
            className={`block bg-gray-900 border rounded-xl p-6 transition-colors ${s.couleur}`}
          >
            <div className="text-3xl mb-3">{s.icon}</div>
            <div className="font-semibold text-white mb-1">{s.titre}</div>
            <p className="text-gray-400 text-sm">{s.description}</p>
            {s.badge && (
              <span className="inline-block mt-3 bg-indigo-900 text-indigo-300 text-xs px-2 py-1 rounded-full">
                {s.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
