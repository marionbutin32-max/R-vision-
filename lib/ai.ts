import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function genererFiche(
  contenuCours: string,
  titreCours: string
): Promise<{ titre: string; contenu: string }> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Tu es un expert en révision médicale pour étudiants PASS/LAS.

Génère une fiche de révision structurée et complète à partir de ce cours de médecine.

La fiche doit être en Markdown avec :
- Un titre principal clair
- Des sections bien organisées (définitions, physiopathologie, clinique, diagnostic, traitement, à retenir)
- Des tableaux quand c'est pertinent
- Des listes à puces pour les points clés
- Les termes importants en **gras**
- Un encadré "Points essentiels" à la fin

Cours : "${titreCours}"

Contenu du cours :
${contenuCours.slice(0, 12000)}`,
      },
    ],
  });

  const contenu =
    message.content[0].type === "text" ? message.content[0].text : "";
  const lignes = contenu.split("\n");
  const titre =
    lignes[0].replace(/^#+\s*/, "").trim() || titreCours;

  return { titre, contenu };
}

export interface QCMExtrait {
  enonce: string;
  options: { texte: string; estCorrecte: boolean }[];
  explication?: string;
  source?: string;
}

export async function extraireQCM(
  contenuPDF: string,
  nomFichier: string
): Promise<QCMExtrait[]> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `Tu es un expert en extraction de QCM médicaux pour étudiants PASS/LAS.

Extrais TOUS les QCM de ce document d'annales médicales et retourne-les en JSON valide.

Format attendu (tableau JSON, rien d'autre) :
[
  {
    "enonce": "Question complète ici",
    "options": [
      {"texte": "Proposition A", "estCorrecte": false},
      {"texte": "Proposition B", "estCorrecte": true},
      {"texte": "Proposition C", "estCorrecte": false},
      {"texte": "Proposition D", "estCorrecte": false},
      {"texte": "Proposition E", "estCorrecte": false}
    ],
    "explication": "Explication de la bonne réponse si disponible"
  }
]

Règles :
- Chaque question doit avoir exactement les propositions du document
- estCorrecte = true UNIQUEMENT pour la/les bonne(s) réponse(s)
- Si plusieurs bonnes réponses, marque toutes les correctes
- Si l'explication n'est pas dans le document, omets le champ
- Retourne UNIQUEMENT le JSON, sans texte avant ou après

Document : "${nomFichier}"

Contenu :
${contenuPDF.slice(0, 15000)}`,
      },
    ],
  });

  const texte =
    message.content[0].type === "text" ? message.content[0].text : "[]";

  try {
    const jsonMatch = texte.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}
