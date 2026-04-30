import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeClinicalOutput, type PatientAssessment } from "@/lib/clinical";
import { removeDirectIdentity } from "@/lib/privacy";

const schema = z.object({
  anonymousPatientId: z.string().min(3),
  stage: z.enum(["T0", "T1", "T2"]),
  date: z.string(),
  profile: z.object({
    id: z.string(),
    professionalIdentifier: z.string(),
    structureType: z.enum(["psychiatrie", "addictologie", "tca", "medico_social", "sport_sante"]),
    mainPopulation: z.enum([
      "adultes",
      "adolescents",
      "personnes_agees",
      "profils_cliniques_specifiques"
    ])
  }),
  questionnaires: z.array(
    z.object({
      key: z.enum(["PHQ9", "GAD7", "BADS", "IMI", "WHOQOL_BREF", "MADRS"]),
      score: z.number(),
      maxScore: z.number()
    })
  ),
  physicalTests: z.array(z.object({ name: z.string(), domain: z.string(), score: z.number(), maxScore: z.number() })),
  psychiatricMetrics: z.object({
    engagement: z.number().min(0).max(100),
    adherence: z.number().min(0).max(100),
    attention: z.number().min(0).max(100),
    effortTolerance: z.number().min(0).max(100)
  }),
  flags: z.object({
    severeMalnutrition: z.boolean(),
    activeTca: z.boolean(),
    effortIntolerance: z.boolean(),
    majorFatigue: z.boolean(),
    lowEngagement: z.boolean(),
    instability: z.boolean()
  }),
  pathology: z.enum(["psychiatrie", "addictologie", "tca", "fragilite", "reconditionnement"]),
  therapeuticObjective: z.enum([
    "douleur_chronique",
    "prevention_chute",
    "capacite_fonctionnelle",
    "activation_comportementale",
    "gestion_addictions",
    "regulation_emotionnelle",
    "sommeil",
    "autonomie"
  ]),
  age: z.number().int().min(10).max(110).optional(),
  biologicalSex: z.enum(["femme", "homme"]).optional()
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const safeBody = removeDirectIdentity(body);
  const parsed = schema.safeParse(safeBody);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide", details: parsed.error.flatten() }, { status: 400 });
  }

  const output = computeClinicalOutput(parsed.data as PatientAssessment);
  return NextResponse.json(output);
}
