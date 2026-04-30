import { NextRequest, NextResponse } from "next/server";
import { computeClinicalOutput, type PatientAssessment } from "@/lib/clinical";
import { removeDirectIdentity } from "@/lib/privacy";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as PatientAssessment;
  const safeBody = removeDirectIdentity(body) as PatientAssessment;
  const output = computeClinicalOutput(safeBody);

  const text = [
    "COMPTE RENDU APA - V3",
    `Patient anonyme: ${safeBody.anonymousPatientId}`,
    `Parcours: ${safeBody.stage} - Date: ${safeBody.date}`,
    `Pathologie: ${safeBody.pathology} | Objectif: ${safeBody.therapeuticObjective}`,
    `Score global: ${output.globalScore}/100`,
    `Score psychiatrique: ${output.psychiatricComplementaryScore}/100`,
    `Alerte: ${output.alertLevel}`,
    `Interpretation: ${output.interpretation}`,
    `Orientation physique: ${output.orientation.physical.join(", ")}`,
    `Orientation psychologique: ${output.orientation.psychological.join(", ")}`,
    `Vigilances: ${output.safety.vigilancePoints.join(", ")}`,
    `Contre-indications: ${
      output.safety.contraindications.length ? output.safety.contraindications.join(", ") : "Aucune majeure"
    }`,
    `Avis medical: ${output.safety.requiresMedicalReview ? "Requis" : "Non requis"}`
  ].join("\n");

  return new NextResponse(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"rapport-${safeBody.anonymousPatientId}.txt\"`
    }
  });
}
