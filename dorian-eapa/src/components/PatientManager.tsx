"use client";

import { useMemo, useState } from "react";
import {
  computeClinicalOutput,
  type PatientAssessment,
  type Pathology,
  type StructureType,
  type TherapeuticObjective
} from "@/lib/clinical";
import { generateAnonymousId } from "@/lib/privacy";
import { RadarProfile } from "@/components/RadarProfile";

interface LocalPatient {
  id: string;
  pathology: Pathology;
  objective: TherapeuticObjective;
  age: number;
  biologicalSex: "femme" | "homme";
}

const pathologyOptions: Pathology[] = [
  "psychiatrie",
  "addictologie",
  "tca",
  "fragilite",
  "reconditionnement"
];

const objectiveOptions: TherapeuticObjective[] = [
  "douleur_chronique",
  "prevention_chute",
  "capacite_fonctionnelle",
  "activation_comportementale",
  "gestion_addictions",
  "regulation_emotionnelle",
  "sommeil",
  "autonomie"
];

export function PatientManager() {
  const [patients, setPatients] = useState<LocalPatient[]>([]);
  const [pathology, setPathology] = useState<Pathology>("psychiatrie");
  const [objective, setObjective] = useState<TherapeuticObjective>("activation_comportementale");
  const [age, setAge] = useState(35);
  const [biologicalSex, setBiologicalSex] = useState<"femme" | "homme">("femme");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => patients.find((p) => p.id === selectedId) ?? null, [patients, selectedId]);

  const result = useMemo(() => {
    if (!selected) return null;
    const structureType: StructureType =
      selected.pathology === "fragilite"
        ? "medico_social"
        : selected.pathology === "reconditionnement"
          ? "sport_sante"
          : selected.pathology;

    const assessment: PatientAssessment = {
      anonymousPatientId: selected.id,
      stage: "T0",
      date: new Date().toISOString().slice(0, 10),
      profile: {
        id: "EAPA-1",
        professionalIdentifier: "RPPS-0000001",
        structureType,
        mainPopulation: selected.age >= 65 ? "personnes_agees" : "adultes"
      },
      questionnaires: [
        { key: "PHQ9", score: 10, maxScore: 27 },
        { key: "GAD7", score: 7, maxScore: 21 },
        { key: "BADS", score: 60, maxScore: 100 },
        { key: "IMI", score: 66, maxScore: 100 },
        { key: "WHOQOL_BREF", score: 58, maxScore: 100 },
        { key: "MADRS", score: selected.pathology === "psychiatrie" ? 24 : 12, maxScore: 60 }
      ],
      physicalTests: [
        { name: "Grip strength", domain: "force", score: selected.age >= 70 ? 16 : 24, maxScore: 40 },
        { name: "Sit-to-stand", domain: "force", score: selected.age >= 70 ? 12 : 18, maxScore: 30 },
        { name: "Marche 6 min", domain: "endurance", score: selected.age >= 70 ? 320 : 430, maxScore: 600 }
      ],
      psychiatricMetrics: {
        engagement: 58,
        adherence: 55,
        attention: 60,
        effortTolerance: 57
      },
      flags: {
        severeMalnutrition: false,
        activeTca: selected.pathology === "tca",
        effortIntolerance: false,
        majorFatigue: true,
        lowEngagement: false,
        instability: selected.pathology === "fragilite"
      },
      pathology: selected.pathology,
      therapeuticObjective: selected.objective,
      age: selected.age,
      biologicalSex: selected.biologicalSex
    };
    return computeClinicalOutput(assessment);
  }, [selected]);

  return (
    <section className="space-y-4 rounded-xl bg-white p-4 shadow">
      <h2 className="text-xl font-semibold">Creation patient</h2>
      <div className="grid gap-3 md:grid-cols-5">
        <select className="rounded border p-2" value={pathology} onChange={(e) => setPathology(e.target.value as Pathology)}>
          {pathologyOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select className="rounded border p-2" value={objective} onChange={(e) => setObjective(e.target.value as TherapeuticObjective)}>
          {objectiveOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <input
          className="rounded border p-2"
          type="number"
          min={10}
          max={110}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        />
        <select
          className="rounded border p-2"
          value={biologicalSex}
          onChange={(e) => setBiologicalSex(e.target.value as "femme" | "homme")}
        >
          <option value="femme">femme</option>
          <option value="homme">homme</option>
        </select>
        <button
          className="rounded bg-blue-700 px-3 py-2 text-white"
          onClick={() => {
            const newPatient: LocalPatient = {
              id: generateAnonymousId(),
              pathology,
              objective,
              age,
              biologicalSex
            };
            setPatients((prev) => [newPatient, ...prev]);
            setSelectedId(newPatient.id);
          }}
        >
          Creer patient
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded border p-3">
          <p className="mb-2 text-sm font-medium">Patients anonymes</p>
          <div className="space-y-2">
            {patients.map((p) => (
              <button
                key={p.id}
                className="block w-full rounded border p-2 text-left text-sm hover:bg-slate-50"
                onClick={() => setSelectedId(p.id)}
              >
                {p.id} - {p.pathology} - {p.objective} - {p.biologicalSex}
              </button>
            ))}
            {patients.length === 0 && <p className="text-sm text-slate-500">Aucun patient cree.</p>}
          </div>
        </article>

        {result && (
          <article className="space-y-2 rounded border p-3 text-sm">
            <p>
              <strong>Score global:</strong> {result.globalScore}/100
            </p>
            <p>
              <strong>Score psychiatrique:</strong> {result.psychiatricComplementaryScore}/100
            </p>
            <p>
              <strong>Alerte:</strong> {result.alertLevel}
            </p>
            <p>
              <strong>Orientation physique:</strong> {result.orientation.physical.join(", ")}
            </p>
            <p>
              <strong>Orientation psychologique:</strong> {result.orientation.psychological.join(", ")}
            </p>
            <p>
              <strong>Tests physiques cles:</strong> {result.keyTests.physical.join(", ")}
            </p>
            <p>
              <strong>Tests psycho cles:</strong> {result.keyTests.psychological.join(", ")}
            </p>
            <p>
              <strong>Prescription intensite:</strong> {result.prescriptionPlan.intensity}
            </p>
            <p>
              <strong>Frequence:</strong> {result.prescriptionPlan.weeklySessions}
            </p>
            <p>
              <strong>Duree:</strong> {result.prescriptionPlan.sessionDuration}
            </p>
            <p>
              <strong>Tests physiques adaptes:</strong> {result.prescriptionPlan.physicalTestsToRun.join(", ")}
            </p>
            <p>
              <strong>Tests psycho adaptes:</strong> {result.prescriptionPlan.psychologicalTestsToRun.join(", ")}
            </p>
            <p>
              <strong>Contre-indications:</strong>{" "}
              {result.safety.contraindications.length > 0 ? result.safety.contraindications.join(", ") : "Aucune majeure"}
            </p>
            <p>
              <strong>Vigilances:</strong> {result.safety.vigilancePoints.join(", ")}
            </p>
            <p>
              <strong>Avis medical requis:</strong> {result.safety.requiresMedicalReview ? "Oui" : "Non"}
            </p>
          </article>
        )}
      </div>

      {result && <RadarProfile {...result.functionalProfile} />}
    </section>
  );
}
