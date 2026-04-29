import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useCreatePatient, getListPatientsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const CONDITIONS = [
  { value: "tca_anorexia", label: "TCA - Anorexie" },
  { value: "tca_bulimia", label: "TCA - Boulimie" },
  { value: "tca_binge", label: "TCA - Hyperphagie" },
  { value: "addiction_alcohol", label: "Addiction - Alcool" },
  { value: "addiction_substances", label: "Addiction - Substances" },
  { value: "addiction_behavioral", label: "Addiction - Comportements" },
  { value: "deconditioning", label: "Déconditionnement" },
  { value: "chronic_fatigue", label: "Fatigue Chronique" },
  { value: "other", label: "Autre" },
];

const formSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  primaryCondition: z.enum(["tca_anorexia", "tca_bulimia", "tca_binge", "addiction_alcohol", "addiction_substances", "addiction_behavioral", "deconditioning", "chronic_fatigue", "other"]),
  medicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  referringDoctor: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PatientNew() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createPatient = useCreatePatient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      primaryCondition: "deconditioning",
    },
  });

  function onSubmit(data: FormValues) {
    createPatient.mutate(
      { data },
      {
        onSuccess: (patient) => {
          queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
          toast({ title: "Patient créé", description: `${patient.firstName} ${patient.lastName} a été ajouté.` });
          setLocation(`/patients/${patient.id}`);
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible de créer le patient.", variant: "destructive" });
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/patients">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nouveau Patient</h1>
          <p className="text-slate-500 text-sm">Créer un nouveau dossier patient</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-teal-600" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} data-testid="input-firstName" placeholder="Marie" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input {...field} data-testid="input-lastName" placeholder="Dupont" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de naissance</FormLabel>
                  <FormControl><Input type="date" {...field} data-testid="input-dateOfBirth" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-gender">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="height" render={({ field }) => (
                <FormItem>
                  <FormLabel>Taille (cm)</FormLabel>
                  <FormControl><Input type="number" {...field} data-testid="input-height" placeholder="165" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem>
                  <FormLabel>Poids (kg)</FormLabel>
                  <FormControl><Input type="number" {...field} data-testid="input-weight" placeholder="62" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations Cliniques</CardTitle>
              <CardDescription>Pathologie principale et contexte médical</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="primaryCondition" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pathologie principale <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-primaryCondition">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONDITIONS.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="referringDoctor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Médecin référent</FormLabel>
                  <FormControl><Input {...field} data-testid="input-referringDoctor" placeholder="Dr. Dupont" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="medicalHistory" render={({ field }) => (
                <FormItem>
                  <FormLabel>Antécédents médicaux</FormLabel>
                  <FormControl>
                    <Textarea {...field} data-testid="textarea-medicalHistory" placeholder="Antécédents pertinents..." rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="currentMedications" render={({ field }) => (
                <FormItem>
                  <FormLabel>Traitements en cours</FormLabel>
                  <FormControl>
                    <Textarea {...field} data-testid="textarea-medications" placeholder="Médicaments et posologie..." rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/patients">
              <Button type="button" variant="outline" data-testid="button-cancel">Annuler</Button>
            </Link>
            <Button
              type="submit"
              data-testid="button-submit"
              disabled={createPatient.isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {createPatient.isPending ? "Création..." : "Créer le patient"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
