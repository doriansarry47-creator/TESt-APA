import { useState } from "react";
import { Link } from "wouter";
import { useListPatients } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, PlusCircle, ChevronRight, User } from "lucide-react";
import { getConditionLabel, formatDate } from "@/lib/constants";

export default function PatientList() {
  const { data: patients, isLoading } = useListPatients();
  const [search, setSearch] = useState("");

  const filteredPatients = patients?.filter(p => 
    p.firstName.toLowerCase().includes(search.toLowerCase()) || 
    p.lastName.toLowerCase().includes(search.toLowerCase()) ||
    getConditionLabel(p.primaryCondition).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patients</h1>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              type="search" 
              placeholder="Rechercher..." 
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/patients/new">
            <Button className="bg-teal-600 hover:bg-teal-700 whitespace-nowrap">
              <PlusCircle className="mr-2 h-4 w-4" /> Nouveau Patient
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filteredPatients?.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <User className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-900">Aucun patient trouvé</h3>
              <p className="mt-1">Modifiez votre recherche ou ajoutez un nouveau patient.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredPatients?.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                      {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{patient.firstName} {patient.lastName}</div>
                      <div className="text-sm text-slate-500 flex gap-2">
                        <span>{getConditionLabel(patient.primaryCondition)}</span>
                        <span>•</span>
                        <span>Ajouté le {formatDate(patient.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/patients/${patient.id}`}>
                      <Button variant="outline" className="hidden sm:flex">Profil Patient</Button>
                    </Link>
                    <Link href={`/assessments/new?patientId=${patient.id}`}>
                      <Button variant="secondary" className="hidden sm:flex bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200">
                        Nouvelle Évaluation
                      </Button>
                    </Link>
                    <Link href={`/patients/${patient.id}`}>
                      <Button variant="ghost" size="icon" className="sm:hidden">
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
