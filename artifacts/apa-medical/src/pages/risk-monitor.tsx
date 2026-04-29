import { useGetRiskSummary, Patient } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Link } from "wouter";
import { getConditionLabel } from "@/lib/constants";

export default function RiskMonitor() {
  const { data: riskSummary, isLoading } = useGetRiskSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Moniteur de Risque Clinique</h1>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[600px] w-full rounded-xl" />
          <Skeleton className="h-[600px] w-full rounded-xl" />
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!riskSummary) return <div>Erreur de chargement.</div>;

  const PatientCard = ({ patient, variant }: { patient: Patient, variant: 'red' | 'orange' | 'green' }) => {
    const bgClass = 
      variant === 'red' ? 'bg-red-50 border-red-200 hover:border-red-300' :
      variant === 'orange' ? 'bg-orange-50 border-orange-200 hover:border-orange-300' :
      'bg-teal-50 border-teal-200 hover:border-teal-300';
      
    const textClass = 
      variant === 'red' ? 'text-red-900' :
      variant === 'orange' ? 'text-orange-900' :
      'text-teal-900';

    return (
      <Link href={`/patients/${patient.id}`}>
        <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${bgClass}`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-semibold ${textClass}`}>{patient.firstName} {patient.lastName}</h3>
              <p className="text-xs text-slate-600 mt-1 truncate max-w-[200px]">{getConditionLabel(patient.primaryCondition)}</p>
            </div>
            {variant === 'red' && <AlertCircle className="h-5 w-5 text-red-600" />}
            {variant === 'orange' && <Clock className="h-5 w-5 text-orange-600" />}
            {variant === 'green' && <CheckCircle className="h-5 w-5 text-teal-600" />}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Moniteur de Risque Clinique</h1>
        <p className="text-slate-500 mt-2 md:mt-0">Vue globale de la stratification des risques</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 flex-1 min-h-0">
        {/* Colonne Rouge */}
        <Card className="flex flex-col border-t-4 border-t-red-600 shadow-sm overflow-hidden bg-slate-50">
          <CardHeader className="bg-white shrink-0 border-b pb-4">
            <CardTitle className="text-red-700 flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                ALERTE ROUGE
              </div>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">{riskSummary.red.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 space-y-3">
            {riskSummary.red.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">Aucun patient en alerte rouge</div>
            ) : (
              riskSummary.red.map(patient => <PatientCard key={patient.id} patient={patient} variant="red" />)
            )}
          </CardContent>
        </Card>

        {/* Colonne Orange */}
        <Card className="flex flex-col border-t-4 border-t-orange-500 shadow-sm overflow-hidden bg-slate-50">
          <CardHeader className="bg-white shrink-0 border-b pb-4">
            <CardTitle className="text-orange-700 flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                ALERTE ORANGE
              </div>
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">{riskSummary.orange.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 space-y-3">
            {riskSummary.orange.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">Aucun patient en alerte orange</div>
            ) : (
              riskSummary.orange.map(patient => <PatientCard key={patient.id} patient={patient} variant="orange" />)
            )}
          </CardContent>
        </Card>

        {/* Colonne Verte */}
        <Card className="flex flex-col border-t-4 border-t-teal-500 shadow-sm overflow-hidden bg-slate-50">
          <CardHeader className="bg-white shrink-0 border-b pb-4">
            <CardTitle className="text-teal-700 flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                STABLE
              </div>
              <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">{riskSummary.green.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 space-y-3">
            {riskSummary.green.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">Aucun patient stable</div>
            ) : (
              riskSummary.green.map(patient => <PatientCard key={patient.id} patient={patient} variant="green" />)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
