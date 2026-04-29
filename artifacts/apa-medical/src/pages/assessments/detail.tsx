import { useParams, Link } from "wouter";
import { ArrowLeft, AlertTriangle, CheckCircle, PrinterIcon, Activity, Brain, Dumbbell, Heart, Footprints, ShieldAlert } from "lucide-react";
import {
  useGetAssessment,
  getGetAssessmentQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip
} from "recharts";

const RISK_CONFIG = {
  red: {
    label: "ALERTE ROUGE",
    bg: "bg-red-50 border-red-300",
    text: "text-red-800",
    badge: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
  },
  orange: {
    label: "ALERTE ORANGE",
    bg: "bg-orange-50 border-orange-300",
    text: "text-orange-800",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
    icon: AlertTriangle,
  },
  green: {
    label: "STABLE",
    bg: "bg-green-50 border-green-300",
    text: "text-green-800",
    badge: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
};

const INTENSITY_LABELS: Record<string, string> = {
  very_light: "Très léger",
  light: "Léger",
  moderate: "Modéré",
  moderate_vigorous: "Modéré-vigoureux",
  vigorous: "Vigoureux",
};

function ScoreBar({ value, label, icon: Icon }: { value: number; label: string; icon: typeof Activity }) {
  const color = value >= 70 ? "bg-green-500" : value >= 45 ? "bg-orange-400" : "bg-red-500";
  return (
    <div className="space-y-1" data-testid={`score-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        <span className="font-bold text-slate-900">{Math.round(value)}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function AssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const assessmentId = parseInt(id, 10);

  const { data: assessment, isLoading } = useGetAssessment(assessmentId, {
    query: { enabled: !!assessmentId, queryKey: getGetAssessmentQueryKey(assessmentId) }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Chargement de l'évaluation...</div>;
  }

  if (!assessment) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Évaluation introuvable</p>
        <Link href="/patients"><Button variant="outline" className="mt-4">Retour</Button></Link>
      </div>
    );
  }

  const riskLevel = (assessment.riskLevel as "red" | "orange" | "green") ?? "orange";
  const riskConfig = RISK_CONFIG[riskLevel] ?? RISK_CONFIG.orange;
  const RiskIcon = riskConfig.icon;

  const domainScores = assessment.domainScores as {
    strength: number; endurance: number; mobility: number;
    psychologicalState: number; effortTolerance: number; clinicalRisk: number;
  } | null;

  const recommendations = assessment.recommendations as {
    programDurationWeeks?: number;
    weeklyFrequency?: number;
    sessionDurationMinutes?: number;
    recommendedIntensity?: string;
    exerciseTypes?: string[];
    contraindications?: string[];
    precautions?: string[];
    progressionPlan?: string;
    weeklyPlan?: Array<{ week: number; objective: string; exercises: string[]; targetIntensity: string; notes: string }>;
  } | null;

  const radarData = domainScores ? [
    { subject: "Force", value: Math.round(domainScores.strength), fullMark: 100 },
    { subject: "Endurance", value: Math.round(domainScores.endurance), fullMark: 100 },
    { subject: "Mobilité", value: Math.round(domainScores.mobility), fullMark: 100 },
    { subject: "État Psychologique", value: Math.round(domainScores.psychologicalState), fullMark: 100 },
    { subject: "Tolérance Effort", value: Math.round(domainScores.effortTolerance), fullMark: 100 },
    { subject: "Risque Clinique", value: Math.round(domainScores.clinicalRisk), fullMark: 100 },
  ] : [];

  const riskFlags = (assessment.riskFlags as string[]) ?? [];

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/patients/${assessment.patientId}`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Retour</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Rapport Dorian EAPA</h1>
            <p className="text-slate-500 text-sm">
              {assessment.assessmentDate ?? "Date non définie"} — {assessment.clinician ?? "Clinicien non renseigné"}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()} data-testid="button-print">
          <PrinterIcon className="h-4 w-4 mr-2" />
          Exporter PDF
        </Button>
      </div>

      {/* Risk Level Banner */}
      {assessment.status === "completed" && (
        <div className={`p-4 border-2 rounded-xl flex items-center gap-3 ${riskConfig.bg}`} data-testid="banner-riskLevel">
          <RiskIcon className={`h-6 w-6 ${riskConfig.text}`} />
          <div>
            <p className={`font-bold text-lg ${riskConfig.text}`}>{riskConfig.label}</p>
            {riskFlags.length > 0 && (
              <p className={`text-sm ${riskConfig.text} opacity-80`}>{riskFlags.length} drapeau(x) clinique(s) détecté(s)</p>
            )}
          </div>
          {assessment.globalScore !== null && assessment.globalScore !== undefined && (
            <div className="ml-auto text-right">
              <p className="text-3xl font-bold text-slate-900" data-testid="text-globalScore">{Math.round(assessment.globalScore)}</p>
              <p className="text-xs text-slate-500">Score fonctionnel global / 100</p>
            </div>
          )}
        </div>
      )}

      {/* Risk Flags */}
      {riskFlags.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              Drapeaux Rouges / Alertes Cliniques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1" data-testid="list-riskFlags">
              {riskFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Scores + Radar */}
      {domainScores && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scores par Domaine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreBar value={domainScores.strength} label="Force musculaire" icon={Dumbbell} />
              <ScoreBar value={domainScores.endurance} label="Endurance cardio" icon={Heart} />
              <ScoreBar value={domainScores.mobility} label="Mobilité" icon={Footprints} />
              <ScoreBar value={domainScores.psychologicalState} label="État psychologique" icon={Brain} />
              <ScoreBar value={domainScores.effortTolerance} label="Tolérance effort" icon={Activity} />
              <ScoreBar value={domainScores.clinicalRisk} label="Risque clinique" icon={ShieldAlert} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profil Fonctionnel (Toile d'araignée)</CardTitle>
              <CardDescription>Représentation radar des 6 domaines d'évaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid gridType="polygon" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: "#475569" }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#0d9488"
                    fill="#0d9488"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}/100`, "Score"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Plan d'Intervention APA</CardTitle>
              <CardDescription>Programme personnalisé basé sur l'évaluation fonctionnelle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Durée programme", value: `${recommendations.programDurationWeeks} semaines` },
                  { label: "Fréquence hebdo", value: `${recommendations.weeklyFrequency} séances` },
                  { label: "Durée séance", value: `${recommendations.sessionDurationMinutes} min` },
                  { label: "Intensité", value: INTENSITY_LABELS[recommendations.recommendedIntensity ?? ""] ?? recommendations.recommendedIntensity },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 bg-teal-50 rounded-lg border border-teal-100">
                    <p className="text-xs text-teal-600 font-medium">{label}</p>
                    <p className="font-bold text-slate-900 mt-1">{value}</p>
                  </div>
                ))}
              </div>

              {recommendations.exerciseTypes && recommendations.exerciseTypes.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Types d'exercices recommandés</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.exerciseTypes.map((ex, i) => (
                      <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {recommendations.contraindications && recommendations.contraindications.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-red-700 mb-2">Contre-indications</p>
                  <ul className="space-y-1">
                    {recommendations.contraindications.map((ci, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">—</span>{ci}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendations.precautions && recommendations.precautions.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-orange-700 mb-2">Précautions</p>
                  <ul className="space-y-1">
                    {recommendations.precautions.map((p, i) => (
                      <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                        <span className="mt-0.5">—</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendations.progressionPlan && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Plan de progression</p>
                  <p className="text-sm text-slate-600">{recommendations.progressionPlan}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {recommendations.weeklyPlan && recommendations.weeklyPlan.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Plan Hebdomadaire Détaillé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3" data-testid="list-weeklyPlan">
                  {recommendations.weeklyPlan.map(week => (
                    <div key={week.week} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-teal-700 text-sm">Semaine {week.week}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{week.targetIntensity}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-1">{week.objective}</p>
                      <ul className="text-sm text-slate-600 space-y-0.5">
                        {week.exercises.map((ex, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-teal-500 mt-0.5">•</span>{ex}
                          </li>
                        ))}
                      </ul>
                      {week.notes && <p className="text-xs text-slate-400 mt-2 italic">{week.notes}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { font-size: 12px; }
          .print\\:space-y-4 > * + * { margin-top: 1rem; }
        }
      `}</style>
    </div>
  );
}
