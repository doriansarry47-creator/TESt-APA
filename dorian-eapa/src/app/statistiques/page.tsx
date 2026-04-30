import { ProgressChart } from "@/components/ProgressChart";
import { RadarProfile } from "@/components/RadarProfile";

export default function StatistiquesPage() {
  const points = [
    { stage: "T0" as const, globalScore: 42 },
    { stage: "T1" as const, globalScore: 56 },
    { stage: "T2" as const, globalScore: 68 }
  ];

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Statistiques</h1>
      <p className="text-sm text-slate-600">
        Suivi longitudinal T0 / T1 / T2 avec lecture progression, stagnation ou regression.
      </p>
      <section className="grid gap-4 md:grid-cols-2">
        <ProgressChart points={points} />
        <RadarProfile physical={70} psychological={62} motivation={66} autonomy={60} />
      </section>
    </main>
  );
}
