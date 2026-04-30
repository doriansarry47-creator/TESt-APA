import type { QuestionnaireKey } from "@/lib/clinical";

export interface QuestionnaireDefinition {
  key: QuestionnaireKey;
  label: string;
  purpose: string;
  min: number;
  max: number;
}

export const QUESTIONNAIRES: QuestionnaireDefinition[] = [
  { key: "PHQ9", label: "PHQ-9", purpose: "Symptomes depressifs", min: 0, max: 27 },
  { key: "GAD7", label: "GAD-7", purpose: "Anxiete", min: 0, max: 21 },
  { key: "BADS", label: "BADS", purpose: "Activation comportementale", min: 0, max: 100 },
  { key: "IMI", label: "Intrinsic Motivation Inventory", purpose: "Motivation intrinseque", min: 0, max: 100 },
  { key: "WHOQOL_BREF", label: "WHOQOL-BREF", purpose: "Qualite de vie", min: 0, max: 100 },
  { key: "MADRS", label: "MADRS (fr)", purpose: "Suivi de severite depressive et activation", min: 0, max: 60 }
];
