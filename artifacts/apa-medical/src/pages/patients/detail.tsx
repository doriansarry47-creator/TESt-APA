import { useParams, Link } from "wouter";
import { ArrowLeft, Calendar, ClipboardList, PlusCircle, TrendingUp, User } from "lucide-react";
import {
  useGetPatient,
  useListPatientAssessments,
  useGetPatientProgress,
  getGetPatientQueryKey,
  getListPatientAssessmentsQueryKey,
  getGetPatientProgressQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const CONDITION_LABELS: Record<string, string> = {
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

const RISK_CONFIG = {
  red: { label: "ALERTE ROUGE", className: "bg-red-100 text-red-800 border-red-200" },
  orange: { label: "ALERTE ORANGE", className: "bg-orange-100 text-orange-800 border-orange-200" },
  green: { label: "STABLE", className: "bg-green-100 text-green-800 border-green-200" },
};

function RiskBadge({ level }: { level?: string | null }) {
  if (!level) return <Badge variant="outline">Non évalué</Badge>;
  const config = RISK_CONFIG[level as keyof typeof RISK_CONFIG];
  if (!config) return <Badge variant="outline">{level}</Badge>;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const patientId = parseInt(id, 10);

  const { data: patient, isLoading: patientLoading } = useGetPatient(patientId, {
    query: { enabled: !!patientId, queryKey: getGetPatientQueryKey(patientId) }
  });
  const { data: assessments = [], isLoading: assessmentsLoading } = useListPatientAssessments(patientId, {
    query: { enabled: !!patientId, queryKey: getListPatientAssessmentsQueryKey(patientId) }
  });
  const { data: progress } = useGetPatientProgress(patientId, {
    query: { enabled: !!patientId, queryKey: getGetPatientProgressQueryKey(patientId) }
  });

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Chargement du patient...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Patient introuvable</p>
        <Link href="/patients"><Button variant="outline" className="mt-4">Retour aux patients</Button></Link>
      </div>
    );
  }

  const age = patient.dateOfBirth
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : null;

  const bmi = patient.height && patient.weight
    ? (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1)
    : null;

  const progressData = progress?.assessments ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/patients">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900" data-testid="text-patientName">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-slate-500 text-sm">{CONDITION_LABELS[patient.primaryCondition] ?? patient.primaryCondition}</p>
          </div>
        </div>
        <Link href={`/assessments/new?patientId=${patient.id}`}>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white" data-testid="button-newAssessment">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouvelle évaluation
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium flex items-center gap-1">
              <User className="h-4 w-4" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {age && <div className="flex justify-between text-sm"><span className="text-slate-500">Âge</span><span className="font-medium">{age} ans</span></div>}
            {patient.gender && <div className="flex justify-between text-sm"><span className="text-slate-500">Genre</span><span className="font-medium">{patient.gender === "female" ? "Femme" : patient.gender === "male" ? "Homme" : "Autre"}</span></div>}
            {patient.height && <div className="flex justify-between text-sm"><span className="text-slate-500">Taille</span><span className="font-medium">{patient.height} cm</span></div>}
            {patient.weight && <div className="flex justify-between text-sm"><span className="text-slate-500">Poids</span><span className="font-medium">{patient.weight} kg</span></div>}
            {bmi && <div className="flex justify-between text-sm"><span className="text-slate-500">IMC</span><span className="font-medium">{bmi}</span></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium">Informations Cliniques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Pathologie</span>
              <span className="font-medium text-right">{CONDITION_LABELS[patient.primaryCondition]}</span>
            </div>
            {patient.referringDoctor && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Référent</span>
                <span className="font-medium">{patient.referringDoctor}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Évaluations</span>
              <span className="font-medium">{assessments.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium">Dernière évaluation</CardTitle>
          </CardHeader>
          <CardContent>
            {assessments[0] ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium">{assessments[0].assessmentDate ?? "—"}</span>
                </div>
                {assessments[0].globalScore !== null && assessments[0].globalScore !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Score global</span>
                    <span className="font-bold text-teal-700">{assessments[0].globalScore}/100</span>
                  </div>
                )}
                <div className="mt-1">
                  <RiskBadge level={assessments[0].riskLevel} />
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Aucune évaluation</p>
            )}
          </CardContent>
        </Card>
      </div>

      {patient.medicalHistory && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium">Antécédents médicaux</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">{patient.medicalHistory}</p>
          </CardContent>
        </Card>
      )}

      {progressData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal-600" />
              Progression du score fonctionnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="globalScore" stroke="#0d9488" strokeWidth={2} dot={{ fill: "#0d9488" }} name="Score global" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-teal-600" />
            Historique des évaluations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assessmentsLoading ? (
            <p className="text-slate-400 text-sm">Chargement...</p>
          ) : assessments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">Aucune évaluation pour ce patient</p>
              <Link href={`/assessments/new?patientId=${patient.id}`}>
                <Button className="mt-3 bg-teal-600 hover:bg-teal-700 text-white" size="sm">
                  Créer la première évaluation
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {assessments.map(a => (
                <Link key={a.id} href={`/assessments/${a.id}`}>
                  <div
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    data-testid={`card-assessment-${a.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="font-medium text-sm">{a.assessmentDate ?? "Date non définie"}</p>
                        {a.clinician && <p className="text-xs text-slate-400">{a.clinician}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {a.globalScore !== null && a.globalScore !== undefined && (
                        <span className="text-sm font-bold text-teal-700">{a.globalScore}/100</span>
                      )}
                      <RiskBadge level={a.riskLevel} />
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        a.status === "completed" ? "bg-green-50 text-green-700" :
                        a.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {a.status === "completed" ? "Terminée" : a.status === "in_progress" ? "En cours" : "Brouillon"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
