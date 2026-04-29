export const CONDITIONS_FR: Record<string, string> = {
  tca_anorexia: "TCA - Anorexie",
  tca_bulimia: "TCA - Boulimie",
  tca_binge: "TCA - Hyperphagie",
  addiction_alcohol: "Addiction - Alcool",
  addiction_substances: "Addiction - Substances",
  addiction_behavioral: "Addiction - Comportements",
  deconditioning: "Déconditionnement",
  chronic_fatigue: "Fatigue Chronique",
  other: "Autre",
};

export function getConditionLabel(condition: string | undefined): string {
  if (!condition) return "Non spécifié";
  return CONDITIONS_FR[condition] || condition;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
