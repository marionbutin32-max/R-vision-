import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@/db/schema";
import path from "path";

const dbPath = path.join(process.cwd(), "data.db");

const client = createClient({
  url: `file:${dbPath}`,
});

export const db = drizzle(client, { schema });

export async function initDb() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS matieres (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      couleur TEXT NOT NULL DEFAULT '#6366f1',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chapitres (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      matiere_id TEXT NOT NULL REFERENCES matieres(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cours (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      filename TEXT NOT NULL,
      contenu_brut TEXT NOT NULL,
      chapitre_id TEXT NOT NULL REFERENCES chapitres(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fiches (
      id TEXT PRIMARY KEY,
      titre TEXT NOT NULL,
      contenu TEXT NOT NULL,
      chapitre_id TEXT NOT NULL REFERENCES chapitres(id),
      cours_id TEXT REFERENCES cours(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      enonce TEXT NOT NULL,
      explication TEXT,
      source TEXT,
      chapitre_id TEXT NOT NULL REFERENCES chapitres(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS options (
      id TEXT PRIMARY KEY,
      texte TEXT NOT NULL,
      est_correcte INTEGER NOT NULL,
      question_id TEXT NOT NULL REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL UNIQUE REFERENCES questions(id),
      facilite REAL NOT NULL DEFAULT 2.5,
      intervalle INTEGER NOT NULL DEFAULT 1,
      repetitions INTEGER NOT NULL DEFAULT 0,
      prochain_revision TEXT NOT NULL DEFAULT (datetime('now')),
      derniere_revision TEXT,
      bonnes_reponses INTEGER NOT NULL DEFAULT 0,
      mauvaises_reponses INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
