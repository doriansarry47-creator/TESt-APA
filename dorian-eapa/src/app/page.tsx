import Link from "next/link";
import { computeClinicalOutput, type PatientAssessment } from "@/lib/clinical";
import { generateAnonymousId } from "@/lib/privacy";
import { RadarProfile } from "@/components/RadarProfile";
import { PatientManager } from "@/components/PatientManager";

const demoAssessment: PatientAssessment = {
  anonymousPatientId: generateAnonymousId(),
  stage: "T0",
  date: new Date().toISOString().slice(0, 10),
  profile: {
    id: "EAPA-1",
    professionalIdentifier: "RPPS-0000001",
    structureType: "psychiatrie",
    mainPopulation: "adultes"
  },
  questionnaires: [
    { key: "PHQ9", score: 11, maxScore: 27 },
    { key: "GAD7", score: 8, maxScore: 21 },
    { key: "BADS", score: 68, maxScore: 100 },
    { key: "IMI", score: 72, maxScore: 100 },
    { key: "WHOQOL_BREF", score: 65, maxScore: 100 }
  ],
  physicalTests: [
    { name: "Grip strength", domain: "force", score: 27, maxScore: 40 },
    { name: "Sit-to-stand", domain: "force", score: 20, maxScore: 30 },
    { name: "Marche 6 min", domain: "endurance", score: 420, maxScore: 600 },
    { name: "Double tache", domain: "cognition_mouvement", score: 70, maxScore: 100 }
  ],
  psychiatricMetrics: {
    engagement: 62,
    adherence: 55,
    attention: 58,
    effortTolerance: 60
  },
  flags: {
    severeMalnutrition: false,
    activeTca: false,
    effortIntolerance: false,
    majorFatigue: true,
    lowEngagement: false,
    instability: false
  },
  pathology: "psychiatrie",
  therapeuticObjective: "activation_comportementale",
  age: 42
};

export default function HomePage() {
  const result = computeClinicalOutput(demoAssessment);

  const alertColor =
    result.alertLevel === "red"
      ? "bg-red-100 text-red-800"
      : result.alertLevel === "orange"
        ? "bg-orange-100 text-orange-800"
        : "bg-emerald-100 text-emerald-800";

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">Dorian EAPA</h1>
        <p className="mt-2 text-slate-600">
          Bilan APA intelligent multi-publics avec logique clinique securisee et suivi T0/T1/T2.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Score global</p>
          <p className="text-3xl font-bold">{result.globalScore}/100</p>
        </article>
        <article className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-slate-500">Score psychiatrique</p>
          <p className="text-3xl font-bold">{result.psychiatricComplementaryScore}/100</p>
        </article>
        <article className={`rounded-xl p-4 shadow ${alertColor}`}>
          <p className="text-sm">Alerte clinique</p>
          <p className="text-xl font-semibold">{result.alertLevel.toUpperCase()}</p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <RadarProfile {...result.functionalProfile} />
        <article className="rounded-xl bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Adaptation automatique</h2>
          <p className="mt-3 text-sm text-slate-700">
            Questionnaires proposes: {result.recommendedQuestionnaires.join(", ")}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Domaines physiques proposes: {result.recommendedDomains.join(", ")}
          </p>
          <p className="mt-2 text-sm text-slate-700">Interpretation automatique: {result.interpretation}</p>
          <Link href="/statistiques" className="mt-4 inline-block text-sm font-medium text-blue-700 underline">
            Voir le module statistiques
          </Link>
        </article>
      </section>
      <PatientManager />
    </main>
  );
}
