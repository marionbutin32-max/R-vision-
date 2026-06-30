import { sql } from "drizzle-orm";
import { text, integer, real, sqliteTable } from "drizzle-orm/sqlite-core";

export const matieres = sqliteTable("matieres", {
  id: text("id").primaryKey(),
  nom: text("nom").notNull(),
  couleur: text("couleur").notNull().default("#6366f1"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const chapitres = sqliteTable("chapitres", {
  id: text("id").primaryKey(),
  nom: text("nom").notNull(),
  matiereId: text("matiere_id")
    .notNull()
    .references(() => matieres.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const cours = sqliteTable("cours", {
  id: text("id").primaryKey(),
  nom: text("nom").notNull(),
  filename: text("filename").notNull(),
  contenuBrut: text("contenu_brut").notNull(),
  chapitreId: text("chapitre_id")
    .notNull()
    .references(() => chapitres.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const fiches = sqliteTable("fiches", {
  id: text("id").primaryKey(),
  titre: text("titre").notNull(),
  contenu: text("contenu").notNull(),
  chapitreId: text("chapitre_id")
    .notNull()
    .references(() => chapitres.id),
  coursId: text("cours_id").references(() => cours.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  enonce: text("enonce").notNull(),
  explication: text("explication"),
  source: text("source"),
  chapitreId: text("chapitre_id")
    .notNull()
    .references(() => chapitres.id),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const options = sqliteTable("options", {
  id: text("id").primaryKey(),
  texte: text("texte").notNull(),
  estCorrecte: integer("est_correcte", { mode: "boolean" }).notNull(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
});

// SM-2 progress tracker per question
export const userProgress = sqliteTable("user_progress", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .unique()
    .references(() => questions.id),
  // SM-2 fields
  facilite: real("facilite").notNull().default(2.5),
  intervalle: integer("intervalle").notNull().default(1),
  repetitions: integer("repetitions").notNull().default(0),
  prochainRevision: text("prochain_revision")
    .notNull()
    .default(sql`(datetime('now'))`),
  derniereRevision: text("derniere_revision"),
  // stats
  bonnesReponses: integer("bonnes_reponses").notNull().default(0),
  mauvaisesReponses: integer("mauvaises_reponses").notNull().default(0),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Matiere = typeof matieres.$inferSelect;
export type Chapitre = typeof chapitres.$inferSelect;
export type Cours = typeof cours.$inferSelect;
export type Fiche = typeof fiches.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Option = typeof options.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
