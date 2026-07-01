// SM-2 spaced repetition algorithm
// score 0-5: 0-2 = fail, 3-5 = pass (5 = perfect)

export interface SM2Input {
  facilite: number;
  intervalle: number;
  repetitions: number;
}

export interface SM2Output {
  facilite: number;
  intervalle: number;
  repetitions: number;
  prochainRevision: Date;
}

export function calculerSM2(input: SM2Input, score: number): SM2Output {
  let { facilite, intervalle, repetitions } = input;

  if (score < 3) {
    // Échec : reprendre depuis le début
    repetitions = 0;
    intervalle = 1;
  } else {
    // Succès
    if (repetitions === 0) {
      intervalle = 1;
    } else if (repetitions === 1) {
      intervalle = 6;
    } else {
      intervalle = Math.round(intervalle * facilite);
    }
    repetitions += 1;
  }

  // Mise à jour du facteur de facilité (min 1.3)
  facilite = Math.max(
    1.3,
    facilite + 0.1 - (5 - score) * (0.08 + (5 - score) * 0.02)
  );

  const prochainRevision = new Date();
  prochainRevision.setDate(prochainRevision.getDate() + intervalle);

  return { facilite, intervalle, repetitions, prochainRevision };
}

// Convertit une réponse correcte/incorrecte en score SM-2
export function scoreDepuisReponse(
  correct: boolean,
  tempsReponse?: number // secondes
): number {
  if (!correct) return 1;
  if (!tempsReponse) return 4;
  if (tempsReponse < 5) return 5;
  if (tempsReponse < 15) return 4;
  return 3;
}
