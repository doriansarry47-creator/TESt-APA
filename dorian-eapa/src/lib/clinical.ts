export type StructureType =
  | "psychiatrie"
  | "addictologie"
  | "tca"
  | "medico_social"
  | "sport_sante";

export type MainPopulation =
  | "adultes"
  | "adolescents"
  | "personnes_agees"
  | "profils_cliniques_specifiques";

export type Stage = "T0" | "T1" | "T2";

export type AlertLevel = "red" | "orange" | "green";

export type QuestionnaireKey =
  | "PHQ9"
  | "GAD7"
  | "BADS"
  | "IMI"
  | "WHOQOL_BREF"
  | "MADRS";

export type PhysicalDomain = "force" | "endurance" | "mobilite" | "cognition_mouvement";
export type Pathology =
  | "psychiatrie"
  | "addictologie"
  | "tca"
  | "fragilite"
  | "reconditionnement";
export type TherapeuticObjective =
  | "douleur_chronique"
  | "prevention_chute"
  | "capacite_fonctionnelle"
  | "activation_comportementale"
  | "gestion_addictions"
  | "regulation_emotionnelle"
  | "sommeil"
  | "autonomie";

export interface EapaProfile {
  id: string;
  professionalIdentifier: string;
  structureType: StructureType;
  mainPopulation: MainPopulation;
}

export interface QuestionnaireResult {
  key: QuestionnaireKey;
  score: number;
  maxScore: number;
}

export interface PhysicalTestResult {
  name: string;
  domain: PhysicalDomain;
  score: number;
  maxScore: number;
}

export interface ClinicalFlags {
  severeMalnutrition: boolean;
  activeTca: boolean;
  effortIntolerance: boolean;
  majorFatigue: boolean;
  lowEngagement: boolean;
  instability: boolean;
}

export interface PatientAssessment {
  anonymousPatientId: string;
  stage: Stage;
  date: string;
  profile: EapaProfile;
  questionnaires: QuestionnaireResult[];
  physicalTests: PhysicalTestResult[];
  psychiatricMetrics: {
    engagement: number;
    adherence: number;
    attention: number;
    effortTolerance: number;
  };
  flags: ClinicalFlags;
  pathology: Pathology;
  therapeuticObjective: TherapeuticObjective;
  age?: number;
  biologicalSex?: "femme" | "homme";
}

export interface ClinicalOutput {
  globalScore: number;
  psychiatricComplementaryScore: number;
  alertLevel: AlertLevel;
  interpretation: "progression" | "stagnation" | "regression";
  functionalProfile: {
    physical: number;
    psychological: number;
    motivation: number;
    autonomy: number;
  };
  recommendedQuestionnaires: QuestionnaireKey[];
  recommendedDomains: PhysicalDomain[];
  orientation: {
    physical: string[];
    psychological: string[];
    vigilance: string[];
  };
  keyTests: {
    physical: string[];
    psychological: string[];
  };
  prescriptionPlan: {
    intensity: "legere" | "moderee" | "modulee";
    weeklySessions: string;
    sessionDuration: string;
    physicalTestsToRun: string[];
    psychologicalTestsToRun: string[];
  };
  safety: {
    contraindications: string[];
    vigilancePoints: string[];
    requiresMedicalReview: boolean;
  };
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

type ScoreZone = "faible" | "intermediaire" | "bon";

interface OnapsThreshold {
  testName: string;
  low: number;
  medium: number;
}

function scoreFromThreshold(value: number, threshold: OnapsThreshold): { zone: ScoreZone; score: number } {
  if (value < threshold.low) return { zone: "faible", score: 35 };
  if (value < threshold.medium) return { zone: "intermediaire", score: 60 };
  return { zone: "bon", score: 85 };
}

function getOnapsLikeThresholds(age?: number, biologicalSex?: "femme" | "homme"): OnapsThreshold[] {
  // Table V3 plus detaillee (inspiree de referentiels fonctionnels type ONAPS).
  const isSenior = Boolean(age && age >= 70);
  const isOlderAdult = Boolean(age && age >= 55 && age < 70);
  const maleGripBoost = biologicalSex === "homme" ? 2 : 0;

  if (isSenior) {
    return [
      { testName: "Marche 6 min", low: 260, medium: 360 },
      { testName: "Sit-to-stand", low: 9, medium: 15 },
      { testName: "Grip strength", low: 13 + maleGripBoost, medium: 20 + maleGripBoost },
      { testName: "Timed up and go", low: 9, medium: 13 }
    ];
  }
  if (isOlderAdult) {
    return [
      { testName: "Marche 6 min", low: 320, medium: 450 },
      { testName: "Sit-to-stand", low: 12, medium: 19 },
      { testName: "Grip strength", low: 16 + maleGripBoost, medium: 26 + maleGripBoost },
      { testName: "Timed up and go", low: 8, medium: 11 }
    ];
  }
  return [
    { testName: "Marche 6 min", low: 380, medium: 520 },
    { testName: "Sit-to-stand", low: 15, medium: 23 },
    { testName: "Grip strength", low: 20 + maleGripBoost, medium: 32 + maleGripBoost },
    { testName: "Timed up and go", low: 7, medium: 10 }
  ];
}

function getQuestionnaireValue(input: PatientAssessment, key: QuestionnaireKey): number | null {
  const found = input.questionnaires.find((q) => q.key === key);
  return found ? found.score : null;
}

function orientationByPathology(pathology: Pathology, objective: TherapeuticObjective) {
  const base = {
    physical: ["Endurance cardio-respiratoire", "Renforcement musculaire", "Mobilite / equilibre"],
    psychological: ["Motivation graduelle", "Auto-efficacite", "Psychoeducation APA"],
    vigilance: ["Progressivite de charge", "Surveillance intolerances", "Pas de mise en echec"]
  };

  if (pathology === "tca") {
    return {
      physical: ["Mobilite douce", "Marche progressive", "Renforcement fonctionnel faible charge"],
      psychological: ["Image corporelle securisee", "Regulation emotionnelle", "Eviter controle excessif"],
      vigilance: ["Risque denutrition", "Arret si intolerance effort", "Coordination equipe pluridisciplinaire"]
    };
  }
  if (pathology === "addictologie") {
    return {
      physical: ["Cardio fractionne modere", "Force globale", "Coordination"],
      psychological: ["Gestion craving", "Controle impulsivite", "Engagement progressif"],
      vigilance: ["Risque rechute", "Fatigabilite", "Adherence fluctuante"]
    };
  }
  if (pathology === "fragilite") {
    return {
      physical: ["Equilibre", "Transferts", "Force membres inferieurs", "Marche securisee"],
      psychological: ["Confiance motrice", "Reduction peur de chute", "Routine autonome"],
      vigilance: ["Prevention chutes", "Aides techniques si besoin", "Controle douleur"]
    };
  }
  if (pathology === "psychiatrie") {
    return {
      physical: ["Activation comportementale par mouvement", "Cardio modere", "Parcours double tache"],
      psychological: ["Regulation emotionnelle", "Attention / fonctions executives", "Renforcement motivation"],
      vigilance: ["Variabilite humeur", "Tolerance effort", "Charge cognitive progressive"]
    };
  }

  if (objective === "prevention_chute") {
    base.physical = ["Equilibre statique et dynamique", "Sit-to-stand", "Marche 6 min adaptee"];
  }
  if (objective === "activation_comportementale") {
    base.psychological = ["Activation comportementale", "Ancrage routine", "Suivi adherence"];
  }
  return base;
}

function keyTestsByContext(pathology: Pathology): { physical: string[]; psychological: string[] } {
  if (pathology === "psychiatrie") {
    return {
      physical: ["Marche 6 min", "Double tache", "Sit-to-stand", "Borg effort percu"],
      psychological: ["PHQ-9", "GAD-7", "BADS", "IMI", "MADRS"]
    };
  }
  if (pathology === "addictologie") {
    return {
      physical: ["Marche 6 min", "Borg", "Sit-to-stand"],
      psychological: ["IMI", "BADS", "GAD-7"]
    };
  }
  if (pathology === "tca") {
    return {
      physical: ["Marche 6 min adaptee", "Equilibre", "Mobilite"],
      psychological: ["WHOQOL-BREF", "IMI", "GAD-7"]
    };
  }
  if (pathology === "fragilite") {
    return {
      physical: ["Timed up and go", "Sit-to-stand", "Grip strength", "Equilibre"],
      psychological: ["IMI", "WHOQOL-BREF"]
    };
  }
  return {
    physical: ["Grip strength", "Sit-to-stand", "Marche 6 min"],
    psychological: ["PHQ-9", "GAD-7", "IMI"]
  };
}

function prescriptionByObjective(
  objective: TherapeuticObjective,
  pathology: Pathology
): ClinicalOutput["prescriptionPlan"] {
  const base: ClinicalOutput["prescriptionPlan"] = {
    intensity: "moderee",
    weeklySessions: "2 a 4 seances / semaine",
    sessionDuration: "30 a 50 minutes",
    physicalTestsToRun: ["Marche 6 min", "Sit-to-stand", "Grip strength", "Borg"],
    psychologicalTestsToRun: ["PHQ-9", "GAD-7", "IMI", "WHOQOL-BREF"]
  };

  if (objective === "activation_comportementale") {
    return {
      intensity: "modulee",
      weeklySessions: "3 a 5 seances courtes / semaine",
      sessionDuration: "20 a 40 minutes",
      physicalTestsToRun: ["Marche 6 min", "Double tache", "Sit-to-stand", "Borg"],
      psychologicalTestsToRun: ["MADRS", "BADS", "PHQ-9", "IMI"]
    };
  }
  if (objective === "prevention_chute") {
    return {
      intensity: "legere",
      weeklySessions: "2 a 4 seances / semaine",
      sessionDuration: "20 a 40 minutes",
      physicalTestsToRun: ["Timed up and go", "Equilibre unipodal", "Sit-to-stand", "Marche 6 min adaptee"],
      psychologicalTestsToRun: ["IMI", "WHOQOL-BREF"]
    };
  }
  if (objective === "gestion_addictions" || pathology === "addictologie") {
    return {
      intensity: "moderee",
      weeklySessions: "3 a 5 seances / semaine",
      sessionDuration: "30 a 45 minutes",
      physicalTestsToRun: ["Marche 6 min", "Borg", "Sit-to-stand", "Coordination"],
      psychologicalTestsToRun: ["BADS", "IMI", "GAD-7", "WHOQOL-BREF"]
    };
  }
  if (pathology === "tca") {
    return {
      intensity: "legere",
      weeklySessions: "2 a 4 seances / semaine",
      sessionDuration: "20 a 35 minutes",
      physicalTestsToRun: ["Mobilite", "Equilibre", "Marche adaptee", "Borg faible intensite"],
      psychologicalTestsToRun: ["MADRS", "GAD-7", "IMI", "WHOQOL-BREF"]
    };
  }
  return base;
}

function buildSafetyProfile(input: PatientAssessment): ClinicalOutput["safety"] {
  const contraindications: string[] = [];
  const vigilancePoints: string[] = [];
  let requiresMedicalReview = false;

  const madrs = getQuestionnaireValue(input, "MADRS");
  if (madrs !== null && madrs >= 30) {
    contraindications.push("Episode depressif severe suspecte: eviter intensite elevee.");
    vigilancePoints.push("Renforcer coordination medico-psy et reevaluation rapprochee.");
    requiresMedicalReview = true;
  }

  if (input.flags.severeMalnutrition) {
    contraindications.push("Denutrition severe: suspendre charges metaboliques elevees.");
    requiresMedicalReview = true;
  }
  if (input.flags.effortIntolerance) {
    contraindications.push("Intolerance a l'effort: arret test maximal et bilan medical.");
    requiresMedicalReview = true;
  }
  if (input.flags.activeTca) {
    vigilancePoints.push("Prioriser securite, progression tres graduelle et cadre non centré sur le poids.");
  }
  if (input.flags.instability) {
    vigilancePoints.push("Instabilite motrice: supervision rapprochee et travail de prevention des chutes.");
  }
  if (input.flags.majorFatigue) {
    vigilancePoints.push("Fatigue importante: fractionner seances et monitorer Borg.");
  }

  if (input.pathology === "addictologie") {
    vigilancePoints.push("Surveiller fluctuations d'adherence et risque de rechute.");
  }
  if (input.pathology === "psychiatrie") {
    vigilancePoints.push("Adapter charge cognitive (double tache) selon attention du jour.");
  }

  return { contraindications, vigilancePoints, requiresMedicalReview };
}

export function selectRecommendations(profile: EapaProfile) {
  const baseQuestionnaires: QuestionnaireKey[] = ["PHQ9", "GAD7", "IMI", "WHOQOL_BREF"];
  const baseDomains: PhysicalDomain[] = ["force", "endurance", "mobilite"];

  switch (profile.structureType) {
    case "psychiatrie":
      return {
        questionnaires: [...baseQuestionnaires, "BADS"],
        domains: [...baseDomains, "cognition_mouvement"] as PhysicalDomain[]
      };
    case "addictologie":
      return {
        questionnaires: [...baseQuestionnaires, "BADS"],
        domains: ["endurance", "mobilite", "cognition_mouvement"] as PhysicalDomain[]
      };
    case "tca":
      return {
        questionnaires: [...baseQuestionnaires],
        domains: ["mobilite", "endurance"] as PhysicalDomain[]
      };
    case "medico_social":
      return {
        questionnaires: [...baseQuestionnaires],
        domains: ["force", "mobilite"] as PhysicalDomain[]
      };
    default:
      return {
        questionnaires: baseQuestionnaires,
        domains: baseDomains
      };
  }
}

export function computeClinicalOutput(input: PatientAssessment): ClinicalOutput {
  const questionnaireMean =
    input.questionnaires.reduce((acc, q) => acc + (q.score / q.maxScore) * 100, 0) /
    Math.max(input.questionnaires.length, 1);
  const physicalMean =
    input.physicalTests.reduce((acc, t) => acc + (t.score / t.maxScore) * 100, 0) /
    Math.max(input.physicalTests.length, 1);
  const psychMetricsMean =
    (input.psychiatricMetrics.engagement +
      input.psychiatricMetrics.adherence +
      input.psychiatricMetrics.attention +
      input.psychiatricMetrics.effortTolerance) /
    4;

  const thresholds = getOnapsLikeThresholds(input.age, input.biologicalSex);
  const onapsScores = input.physicalTests
    .map((test) => {
      const ref = thresholds.find((t) => t.testName.toLowerCase() === test.name.toLowerCase());
      if (!ref) return (test.score / test.maxScore) * 100;
      return scoreFromThreshold(test.score, ref).score;
    })
    .reduce((acc, v) => acc + v, 0) / Math.max(input.physicalTests.length, 1);

  const globalScore = clamp(onapsScores * 0.45 + questionnaireMean * 0.35 + psychMetricsMean * 0.2);
  const psychiatricComplementaryScore = clamp(psychMetricsMean * 0.6 + questionnaireMean * 0.4);

  let alertLevel: AlertLevel = "green";
  if (input.flags.severeMalnutrition || input.flags.activeTca || input.flags.effortIntolerance) {
    alertLevel = "red";
  } else if (input.flags.majorFatigue || input.flags.lowEngagement || input.flags.instability) {
    alertLevel = "orange";
  }

  const interpretation: ClinicalOutput["interpretation"] =
    globalScore >= 70 ? "progression" : globalScore >= 45 ? "stagnation" : "regression";

  const recommendations = selectRecommendations(input.profile);
  const orientation = orientationByPathology(input.pathology, input.therapeuticObjective);
  const keyTests = keyTestsByContext(input.pathology);
  const prescriptionPlan = prescriptionByObjective(input.therapeuticObjective, input.pathology);
  const safety = buildSafetyProfile(input);

  return {
    globalScore: Math.round(globalScore),
    psychiatricComplementaryScore: Math.round(psychiatricComplementaryScore),
    alertLevel,
    interpretation,
    functionalProfile: {
      physical: Math.round(onapsScores),
      psychological: Math.round(questionnaireMean),
      motivation: Math.round(
        (input.psychiatricMetrics.engagement + input.psychiatricMetrics.adherence) / 2
      ),
      autonomy: Math.round(
        (input.psychiatricMetrics.effortTolerance + input.psychiatricMetrics.attention) / 2
      )
    },
    recommendedQuestionnaires: recommendations.questionnaires,
    recommendedDomains: recommendations.domains,
    orientation,
    keyTests,
    prescriptionPlan,
    safety
  };
}
