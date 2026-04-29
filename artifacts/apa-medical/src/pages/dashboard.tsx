import { Link } from "wouter";
import { 
  useGetDashboardStats, 
  useGetRiskSummary,
  DashboardStats 
} from "@workspace/api-client-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Users, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CONDITIONS_FR, getConditionLabel, formatDate } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="h-96 w-full rounded-xl lg:col-span-4" />
          <Skeleton className="h-96 w-full rounded-xl lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (!stats) return <div>Erreur de chargement des statistiques.</div>;

  const conditionData = stats.conditionBreakdown.map(item => ({
    name: getConditionLabel(item.condition),
    value: item.count
  }));

  const COLORS = ['#0d9488', '#0284c7', '#2563eb', '#4f46e5', '#7c3aed', '#9333ea', '#c026d3', '#db2777', '#e11d48'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
        <div className="mt-4 md:mt-0">
          <Link href="/patients/new">
            <Button className="bg-teal-600 hover:bg-teal-700">Nouveau Patient</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-slate-400">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalPatients}</div>
            <p className="text-xs text-slate-500 mt-1">Actifs dans la clinique</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Alerte Verte</CardTitle>
            <CheckCircle className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">{stats.greenCount}</div>
            <p className="text-xs text-teal-600/70 mt-1">Patients stables</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Alerte Orange</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats.orangeAlertCount}</div>
            <p className="text-xs text-orange-600/70 mt-1">Surveillance requise</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Alerte Rouge</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.redAlertCount}</div>
            <p className="text-xs text-red-600/70 mt-1">Intervention urgente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Évaluations Récentes</CardTitle>
            <CardDescription>Les 5 dernières évaluations cliniques complétées.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentAssessments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Aucune évaluation récente.</div>
              ) : (
                stats.recentAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Patient #{assessment.patientId}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(assessment.assessmentDate)} • par {assessment.clinician}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{assessment.globalScore}/100</p>
                        <p className="text-[10px] text-slate-500 uppercase">Score Global</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          assessment.riskLevel === 'red' ? 'bg-red-50 text-red-700 border-red-200' :
                          assessment.riskLevel === 'orange' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-teal-50 text-teal-700 border-teal-200'
                        }
                      >
                        {assessment.riskLevel === 'red' ? 'ROUGE' : assessment.riskLevel === 'orange' ? 'ORANGE' : 'VERT'}
                      </Badge>
                      <Link href={`/assessments/${assessment.id}`}>
                        <Button variant="ghost" size="sm" className="h-8">Voir</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Répartition des Pathologies</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {conditionData.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Aucune donnée disponible.</div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={conditionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {conditionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} patients`, 'Total']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
