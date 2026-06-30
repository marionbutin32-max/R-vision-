"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Fiche {
  id: string;
  titre: string;
  contenu: string;
  createdAt: string;
}

export default function FichesPage() {
  const { matiereId, chapitreId } = useParams<{
    matiereId: string;
    chapitreId: string;
  }>();

  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [selected, setSelected] = useState<Fiche | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/fiches?chapitreId=${chapitreId}`)
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setFiches(list);
        if (list.length > 0) setSelected(list[0]);
        setLoading(false);
      });
  }, [chapitreId]);

  const baseBack = `/matieres/${matiereId}/chapitres/${chapitreId}`;

  if (loading) return <div className="text-gray-500">Chargement...</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href={baseBack} className="text-gray-500 hover:text-white text-sm">
          ← Retour au chapitre
        </Link>
        <h1 className="text-2xl font-bold mt-3">Fiches de révision</h1>
      </div>

      {fiches.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-3xl mb-3">📄</div>
          <p>Aucune fiche pour l'instant.</p>
          <Link
            href={`${baseBack}/upload`}
            className="inline-block mt-4 text-indigo-400 hover:underline text-sm"
          >
            Uploader un cours pour générer une fiche →
          </Link>
        </div>
      ) : (
        <div className="flex gap-5">
          {/* Sidebar : liste des fiches */}
          <div className="w-56 shrink-0 space-y-2">
            {fiches.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selected?.id === f.id
                    ? "bg-indigo-900/60 text-white border border-indigo-600"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <div className="font-medium truncate">{f.titre}</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {new Date(f.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </button>
            ))}
          </div>

          {/* Contenu de la fiche */}
          {selected && (
            <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-6 overflow-auto">
              <div className="prose prose-invert prose-sm max-w-none
                prose-headings:font-bold prose-headings:text-white
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base
                prose-p:text-gray-300 prose-li:text-gray-300
                prose-strong:text-white
                prose-table:text-sm prose-td:border prose-td:border-gray-700 prose-th:border prose-th:border-gray-600
                prose-th:bg-gray-800 prose-th:text-white prose-td:px-3 prose-td:py-2
                prose-blockquote:border-indigo-500 prose-blockquote:text-gray-300
                prose-code:text-indigo-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selected.contenu}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
