interface BodyCompositionData {
  bmi?: number;
  unintentionalWeightLoss?: boolean;
  weightLossKg?: number;
  malnutritionSuspicion?: boolean;
  mnaScore?: number;
}

interface MuscularFunctionData {
  gripStrengthDominant?: number;
  sitToStand30s?: number;
  sarcopeniaRisk?: string;
  globalMuscularEndurance?: string;
}

interface CardioRespiratoryData {
  sixMinuteWalkDistance?: number;
  borgScaleRating?: number;
  postEffortFatigue?: string;
  exerciseIntolerance?: boolean;
  heartRateRecovery?: number;
}

interface MobilityFunctionData {
  staticBalance?: string;
  dynamicBalance?: string;
  functionalRangeOfMotion?: string;
  fallRisk?: string;
}

interface PsychologicalData {
  motivationLevel?: number;
  bodyImageAnxiety?: number;
  bodyImageDisturbance?: boolean;
  compulsiveExercise?: boolean;
  impulsivity?: number;
  selfEfficacy?: number;
  qualityOfLife?: number;
  psychologicalDistress?: string;
}

interface AddictionBehaviorData {
  cravingLevel?: number;
  recentRelapse?: boolean;
  effortAvoidance?: boolean;
  emotionalRegulation?: string;
  substanceCurrentUse?: boolean;
  addictionStabilized?: boolean;
}

interface AssessmentData {
  bodyComposition?: BodyCompositionData;
  muscularFunction?: MuscularFunctionData;
  cardioRespiratory?: CardioRespiratoryData;
  mobilityFunction?: MobilityFunctionData;
  psychologicalStatus?: PsychologicalData;
  addictionBehavior?: AddictionBehaviorData;
}

interface DomainScores {
  strength: number;
  endurance: number;
  mobility: number;
  psychologicalState: number;
  effortTolerance: number;
  clinicalRisk: number;
}

interface APARecommendations {
  programDurationWeeks: number;
  weeklyFrequency: number;
  sessionDurationMinutes: number;
  recommendedIntensity: string;
  exerciseTypes: string[];
  contraindications: string[];
  precautions: string[];
  progressionPlan: string;
  weeklyPlan: Array<{
    week: number;
    objective: string;
    exercises: string[];
    targetIntensity: string;
    notes: string;
  }>;
}

export function computeStrengthScore(data?: MuscularFunctionData): number {
  if (!data) return 50;
  let score = 50;
  if (data.gripStrengthDominant !== undefined) {
    if (data.gripStrengthDominant >= 30) score += 20;
    else if (data.gripStrengthDominant >= 20) score += 10;
    else score -= 10;
  }
  if (data.sitToStand30s !== undefined) {
    if (data.sitToStand30s >= 12) score += 20;
    else if (data.sitToStand30s >= 8) score += 10;
    else score -= 10;
  }
  if (data.sarcopeniaRisk === "high") score -= 20;
  else if (data.sarcopeniaRisk === "moderate") score -= 10;
  if (data.globalMuscularEndurance === "excellent") score += 10;
  else if (data.globalMuscularEndurance === "poor") score -= 15;
  return Math.max(0, Math.min(100, score));
}

export function computeEnduranceScore(data?: CardioRespiratoryData): number {
  if (!data) return 50;
  let score = 50;
  if (data.sixMinuteWalkDistance !== undefined) {
    if (data.sixMinuteWalkDistance >= 500) score += 30;
    else if (data.sixMinuteWalkDistance >= 350) score += 15;
    else if (data.sixMinuteWalkDistance >= 200) score += 0;
    else score -= 20;
  }
  if (data.exerciseIntolerance) score -= 20;
  if (data.postEffortFatigue === "severe") score -= 15;
  else if (data.postEffortFatigue === "moderate") score -= 8;
  return Math.max(0, Math.min(100, score));
}

export function computeMobilityScore(data?: MobilityFunctionData): number {
  if (!data) return 50;
  let score = 50;
  const balanceMap: Record<string, number> = { poor: -15, moderate: 0, good: 10, excellent: 20 };
  const rangeMap: Record<string, number> = { limited: -20, reduced: -10, normal: 10, full: 20 };
  if (data.staticBalance) score += balanceMap[data.staticBalance] ?? 0;
  if (data.dynamicBalance) score += balanceMap[data.dynamicBalance] ?? 0;
  if (data.functionalRangeOfMotion) score += rangeMap[data.functionalRangeOfMotion] ?? 0;
  if (data.fallRisk === "high") score -= 20;
  else if (data.fallRisk === "moderate") score -= 10;
  return Math.max(0, Math.min(100, score));
}

export function computePsychologicalScore(data?: PsychologicalData): number {
  if (!data) return 50;
  let score = 50;
  if (data.motivationLevel !== undefined) score += (data.motivationLevel - 5) * 3;
  if (data.selfEfficacy !== undefined) score += (data.selfEfficacy - 5) * 2;
  if (data.qualityOfLife !== undefined) score += (data.qualityOfLife - 5) * 2;
  if (data.bodyImageDisturbance) score -= 10;
  if (data.compulsiveExercise) score -= 15;
  if (data.psychologicalDistress === "severe") score -= 20;
  else if (data.psychologicalDistress === "moderate") score -= 10;
  if (data.bodyImageAnxiety !== undefined && data.bodyImageAnxiety > 7) score -= 10;
  return Math.max(0, Math.min(100, score));
}

export function computeEffortToleranceScore(cardio?: CardioRespiratoryData, muscular?: MuscularFunctionData): number {
  let score = 50;
  if (cardio?.borgScaleRating !== undefined) {
    if (cardio.borgScaleRating <= 11) score += 20;
    else if (cardio.borgScaleRating <= 14) score += 5;
    else score -= 15;
  }
  if (cardio?.postEffortFatigue === "severe") score -= 20;
  else if (cardio?.postEffortFatigue === "moderate") score -= 10;
  if (cardio?.exerciseIntolerance) score -= 15;
  if (muscular?.globalMuscularEndurance === "excellent") score += 10;
  else if (muscular?.globalMuscularEndurance === "poor") score -= 15;
  return Math.max(0, Math.min(100, score));
}

export function computeClinicalRiskScore(data: AssessmentData): number {
  let riskPoints = 0;
  const bc = data.bodyComposition;
  const cr = data.cardioRespiratory;
  const ps = data.psychologicalStatus;
  const ab = data.addictionBehavior;

  if (bc?.bmi !== undefined) {
    if (bc.bmi < 14) riskPoints += 40;
    else if (bc.bmi < 17.5) riskPoints += 25;
    else if (bc.bmi < 18.5) riskPoints += 15;
  }
  if (bc?.malnutritionSuspicion) riskPoints += 20;
  if (bc?.unintentionalWeightLoss && (bc?.weightLossKg ?? 0) > 5) riskPoints += 15;
  if (cr?.exerciseIntolerance) riskPoints += 10;
  if (cr?.postEffortFatigue === "severe") riskPoints += 15;
  if (ps?.compulsiveExercise) riskPoints += 20;
  if (ps?.psychologicalDistress === "severe") riskPoints += 10;
  if (ab?.substanceCurrentUse && !ab?.addictionStabilized) riskPoints += 25;
  if (ab?.recentRelapse) riskPoints += 15;

  const riskScore = Math.max(0, 100 - riskPoints);
  return Math.max(0, Math.min(100, riskScore));
}

export function computeRiskFlags(data: AssessmentData): string[] {
  const flags: string[] = [];
  const bc = data.bodyComposition;
  const cr = data.cardioRespiratory;
  const ps = data.psychologicalStatus;
  const ab = data.addictionBehavior;
  const mf = data.muscularFunction;
  const mob = data.mobilityFunction;

  if (bc?.bmi !== undefined && bc.bmi < 14) flags.push("IMC critique (<14) — risque vital");
  else if (bc?.bmi !== undefined && bc.bmi < 17.5) flags.push("IMC très bas (<17.5) — dénutrition probable");
  else if (bc?.bmi !== undefined && bc.bmi < 18.5) flags.push("IMC bas (<18.5) — surveillance nutritionnelle requise");
  if (bc?.malnutritionSuspicion) flags.push("Suspicion de dénutrition — évaluation nutritionnelle urgente");
  if (bc?.unintentionalWeightLoss && (bc?.weightLossKg ?? 0) > 5) flags.push(`Perte de poids involontaire : ${bc?.weightLossKg}kg`);
  if (cr?.exerciseIntolerance) flags.push("Intolérance à l'effort — contre-indication à l'effort intense");
  if (cr?.postEffortFatigue === "severe") flags.push("Fatigue post-effort sévère");
  if (ps?.compulsiveExercise) flags.push("Exercice compulsif détecté — TCA actif possible");
  if (ps?.psychologicalDistress === "severe") flags.push("Détresse psychologique sévère — évaluation psychiatrique recommandée");
  if (ps?.bodyImageDisturbance) flags.push("Perturbation image corporelle");
  if (ab?.substanceCurrentUse && !ab?.addictionStabilized) flags.push("Addiction active non stabilisée — effort intense contre-indiqué");
  if (ab?.recentRelapse) flags.push("Rechute récente — adaptation du programme requise");
  if (mf?.sarcopeniaRisk === "high") flags.push("Risque sarcopénique élevé (EWGSOP2)");
  if (mob?.fallRisk === "high") flags.push("Risque de chute élevé — supervision obligatoire");
  return flags;
}

export function computeRiskLevel(flags: string[], domainScores: DomainScores): "red" | "orange" | "green" {
  const criticalFlags = [
    "IMC critique",
    "Suspicion de dénutrition",
    "Intolérance à l'effort",
    "Exercice compulsif",
    "Addiction active non stabilisée",
    "Détresse psychologique sévère",
  ];
  for (const flag of flags) {
    for (const critical of criticalFlags) {
      if (flag.includes(critical)) return "red";
    }
  }
  if (flags.length >= 3) return "orange";
  if (domainScores.clinicalRisk < 40) return "red";
  if (domainScores.clinicalRisk < 65 || flags.length >= 1) return "orange";
  return "green";
}

export function generateRecommendations(
  riskLevel: "red" | "orange" | "green",
  data: AssessmentData,
  primaryCondition: string
): APARecommendations {
  const isTCA = primaryCondition.startsWith("tca");
  const isAddiction = primaryCondition.startsWith("addiction");

  if (riskLevel === "red") {
    return {
      programDurationWeeks: 12,
      weeklyFrequency: 2,
      sessionDurationMinutes: 20,
      recommendedIntensity: "very_light",
      exerciseTypes: [
        "Mobilité articulaire douce",
        "Étirements passifs",
        "Respiration et relaxation",
        "Marche courte supervisée",
      ],
      contraindications: [
        "Tout effort cardiovasculaire intense",
        "Exercices de résistance maximale",
        isTCA ? "Exercices à visée corporelle" : "",
        isAddiction ? "Effort solitaire sans encadrement" : "",
      ].filter(Boolean),
      precautions: [
        "Surveillance médicale obligatoire",
        "Monitoring fréquence cardiaque",
        "Arrêt immédiat si vertige ou malaise",
        "Accompagnement psychologique parallèle",
      ],
      progressionPlan: "Réévaluation médicale avant tout ajustement. Progression uniquement sur avis médical.",
      weeklyPlan: [
        { week: 1, objective: "Évaluation de la tolérance basale", exercises: ["Marche 5-10 min", "Respiration guidée"], targetIntensity: "Très léger (Borg 9-10)", notes: "Surveillance constante" },
        { week: 2, objective: "Stabilisation", exercises: ["Marche 10 min", "Mobilité douce"], targetIntensity: "Très léger (Borg 9-10)", notes: "Tolérance vérifiée avant progression" },
        { week: 3, objective: "Stabilisation continue", exercises: ["Marche 10-15 min", "Étirements"], targetIntensity: "Léger (Borg 10-11)", notes: "Progression conditionnée à la stabilité clinique" },
      ],
    };
  }

  if (riskLevel === "orange") {
    return {
      programDurationWeeks: 8,
      weeklyFrequency: 3,
      sessionDurationMinutes: 30,
      recommendedIntensity: "light",
      exerciseTypes: [
        "Marche progressive",
        "Exercices de renforcement léger",
        "Mobilité et souplesse",
        "Exercices de coordination",
        isAddiction ? "Activités plaisir / bien-être" : "Proprioception",
      ].filter(Boolean),
      contraindications: [
        "Effort cardiovasculaire d'intensité modérée-élevée",
        isTCA ? "Pesée avant/après séance" : "",
      ].filter(Boolean),
      precautions: [
        "Supervision par kinésiologue ou professionnel APA",
        "Surveillance des signes de fatigue excessive",
        "Évaluation hebdomadaire de la tolérance",
      ],
      progressionPlan: "Progression par paliers de 2 semaines. Augmentation de 5-10% du volume hebdomadaire.",
      weeklyPlan: [
        { week: 1, objective: "Conditionnement aérobie léger", exercises: ["Marche 15 min", "Renforcement léger membres inférieurs"], targetIntensity: "Léger (Borg 11-12)", notes: "Adaptation aux douleurs ou fatigue" },
        { week: 2, objective: "Consolidation", exercises: ["Marche 20 min", "Circuit renforcement"], targetIntensity: "Léger (Borg 12)", notes: "" },
        { week: 3, objective: "Progression volume", exercises: ["Marche 25 min", "Renforcement + équilibre"], targetIntensity: "Léger-modéré (Borg 12-13)", notes: "" },
        { week: 4, objective: "Diversification", exercises: ["Marche nordique ou vélo doux", "Renforcement global"], targetIntensity: "Modéré (Borg 13)", notes: "" },
      ],
    };
  }

  return {
    programDurationWeeks: 6,
    weeklyFrequency: 4,
    sessionDurationMinutes: 45,
    recommendedIntensity: "moderate",
    exerciseTypes: [
      "Entraînement aérobie continu",
      "Renforcement musculaire progressif",
      "Exercices fonctionnels",
      "Activités sportives adaptées",
      "Travail d'équilibre et proprioception",
    ],
    contraindications: [],
    precautions: [
      "Échauffement systématique 10 min",
      "Hydratation régulière",
      "Écoute des signaux corporels",
    ],
    progressionPlan: "Programme progressif standard. Réévaluation à 6 semaines avec tests de condition physique.",
    weeklyPlan: [
      { week: 1, objective: "Activation cardiovasculaire", exercises: ["Marche rapide 30 min", "Renforcement membres inférieurs", "Gainage"], targetIntensity: "Modéré (Borg 13-14)", notes: "Baseline performance" },
      { week: 2, objective: "Renforcement progressif", exercises: ["Course légère 20 min + marche", "Circuit renforcement complet"], targetIntensity: "Modéré (Borg 13-14)", notes: "" },
      { week: 3, objective: "Augmentation volume", exercises: ["Cardio 35 min", "Renforcement + équilibre"], targetIntensity: "Modéré-soutenu (Borg 14-15)", notes: "" },
      { week: 4, objective: "Diversification activités", exercises: ["Sport collectif adapté", "Renforcement fonctionnel"], targetIntensity: "Modéré (Borg 14)", notes: "" },
      { week: 5, objective: "Performance progressive", exercises: ["HIIT léger", "Renforcement avancé"], targetIntensity: "Modéré-vigoureux (Borg 14-15)", notes: "" },
      { week: 6, objective: "Bilan et réévaluation", exercises: ["Test de condition physique", "Programme autonome"], targetIntensity: "Variable selon tests", notes: "Réévaluation complète" },
    ],
  };
}

export function computeAssessmentScores(data: AssessmentData, primaryCondition: string) {
  const domainScores: DomainScores = {
    strength: computeStrengthScore(data.muscularFunction),
    endurance: computeEnduranceScore(data.cardioRespiratory),
    mobility: computeMobilityScore(data.mobilityFunction),
    psychologicalState: computePsychologicalScore(data.psychologicalStatus),
    effortTolerance: computeEffortToleranceScore(data.cardioRespiratory, data.muscularFunction),
    clinicalRisk: computeClinicalRiskScore(data),
  };

  const globalScore = Math.round(
    (domainScores.strength * 0.18 +
      domainScores.endurance * 0.2 +
      domainScores.mobility * 0.15 +
      domainScores.psychologicalState * 0.2 +
      domainScores.effortTolerance * 0.12 +
      domainScores.clinicalRisk * 0.15)
  );

  const riskFlags = computeRiskFlags(data);
  const riskLevel = computeRiskLevel(riskFlags, domainScores);
  const recommendations = generateRecommendations(riskLevel, data, primaryCondition);

  return { domainScores, globalScore, riskFlags, riskLevel, recommendations };
}
