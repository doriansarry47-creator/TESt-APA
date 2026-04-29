import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";
import {
  useListPatients,
  useCreateAssessment,
  useUpdateAssessment,
  useCompleteAssessment,
  getListPatientsQueryKey,
  getListPatientAssessmentsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Patient & Clinicien" },
  { id: 2, label: "Composition corporelle" },
  { id: 3, label: "Force musculaire" },
  { id: 4, label: "Cardio-respiratoire" },
  { id: 5, label: "Mobilité & Équilibre" },
  { id: 6, label: "Psychologie" },
  { id: 7, label: "Addiction & Comportement" },
];

export default function AssessmentNew() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preSelectedPatientId = params.get("patientId") ? parseInt(params.get("patientId")!, 10) : undefined;

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);

  const { data: patients = [] } = useListPatients({ query: { queryKey: getListPatientsQueryKey() } });
  const createAssessment = useCreateAssessment();
  const updateAssessment = useUpdateAssessment();
  const completeAssessment = useCompleteAssessment();

  const [formData, setFormData] = useState<Record<string, unknown>>({
    patientId: preSelectedPatientId ?? "",
    clinician: "",
    assessmentDate: new Date().toISOString().split("T")[0],
  });

  function updateField(section: string | null, field: string, value: unknown) {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...(prev[section] as Record<string, unknown> ?? {}), [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }

  async function handleNext() {
    if (currentStep === 1) {
      if (!formData.patientId) {
        toast({ title: "Erreur", description: "Veuillez sélectionner un patient.", variant: "destructive" });
        return;
      }
      if (!assessmentId) {
        try {
          const a = await new Promise<{ id: number }>((resolve, reject) => {
            createAssessment.mutate(
              { data: { patientId: formData.patientId as number, clinician: formData.clinician as string, assessmentDate: formData.assessmentDate as string } },
              { onSuccess: (d) => resolve(d as { id: number }), onError: reject }
            );
          });
          setAssessmentId(a.id);
        } catch {
          toast({ title: "Erreur", description: "Impossible de créer l'évaluation.", variant: "destructive" });
          return;
        }
      }
    }
    setCurrentStep(s => Math.min(s + 1, STEPS.length));
  }

  function handleBack() {
    setCurrentStep(s => Math.max(s - 1, 1));
  }

  async function handleComplete() {
    if (!assessmentId) return;

    const updateData = {
      bodyComposition: formData.bodyComposition as Record<string, unknown> | undefined,
      muscularFunction: formData.muscularFunction as Record<string, unknown> | undefined,
      cardioRespiratory: formData.cardioRespiratory as Record<string, unknown> | undefined,
      mobilityFunction: formData.mobilityFunction as Record<string, unknown> | undefined,
      psychologicalStatus: formData.psychologicalStatus as Record<string, unknown> | undefined,
      addictionBehavior: formData.addictionBehavior as Record<string, unknown> | undefined,
    };

    try {
      await new Promise<void>((resolve, reject) => {
        updateAssessment.mutate(
          { id: assessmentId, data: updateData },
          { onSuccess: () => resolve(), onError: reject }
        );
      });
      await new Promise<void>((resolve, reject) => {
        completeAssessment.mutate(
          { id: assessmentId },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getListPatientAssessmentsQueryKey(formData.patientId as number) });
              resolve();
            },
            onError: reject
          }
        );
      });
      toast({ title: "Évaluation terminée", description: "Les scores ont été calculés automatiquement." });
      setLocation(`/assessments/${assessmentId}`);
    } catch {
      toast({ title: "Erreur", description: "Impossible de terminer l'évaluation.", variant: "destructive" });
    }
  }

  const getFieldValue = (section: string, field: string, defaultVal: unknown = ""): unknown => {
    const s = formData[section] as Record<string, unknown> | undefined;
    return s?.[field] ?? defaultVal;
  };

  const getStrVal = (section: string, field: string, defaultVal = ""): string =>
    String(getFieldValue(section, field, defaultVal));

  const getNumVal = (section: string, field: string, defaultVal = 0): number =>
    Number(getFieldValue(section, field, defaultVal));

  const getBoolVal = (section: string, field: string): boolean =>
    Boolean(getFieldValue(section, field, false));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/patients">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Retour</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nouvelle Évaluation Dorian EAPA</h1>
          <p className="text-slate-500 text-sm">Évaluation fonctionnelle clinique complète</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center overflow-x-auto gap-0">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center shrink-0">
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              currentStep === step.id ? "bg-teal-600 text-white" :
              currentStep > step.id ? "bg-teal-100 text-teal-700" :
              "bg-slate-100 text-slate-500"
            )}>
              {currentStep > step.id ? <Check className="h-3 w-3" /> : <span>{step.id}</span>}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300 mx-1 shrink-0" />}
          </div>
        ))}
      </div>

      <Card>
        {/* Step 1: Patient & Clinician */}
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle>Patient et Clinicien</CardTitle>
              <CardDescription>Sélectionnez le patient et renseignez les informations de la séance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Patient <span className="text-red-500">*</span></Label>
                <Select
                  value={String(formData.patientId ?? "")}
                  onValueChange={v => updateField(null, "patientId", parseInt(v, 10))}
                >
                  <SelectTrigger data-testid="select-patient" className="mt-1">
                    <SelectValue placeholder="Sélectionner un patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.firstName} {p.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Clinicien évaluateur</Label>
                <Input
                  className="mt-1"
                  value={String(formData.clinician ?? "")}
                  onChange={e => updateField(null, "clinician", e.target.value)}
                  placeholder="Dr. Nom, Titre"
                  data-testid="input-clinician"
                />
              </div>
              <div>
                <Label>Date d'évaluation</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={String(formData.assessmentDate ?? "")}
                  onChange={e => updateField(null, "assessmentDate", e.target.value)}
                  data-testid="input-assessmentDate"
                />
              </div>
            </CardContent>
          </>
        )}

        {/* Step 2: Body Composition */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle>Composition Corporelle & Nutrition</CardTitle>
              <CardDescription>Évaluation nutritionnelle et anthropométrique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Attention TCA :</strong> En cas d'anorexie, éviter les discussions centrées sur le poids. Se concentrer sur l'état fonctionnel général.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>IMC (kg/m²)</Label>
                  <Input type="number" step="0.1" className="mt-1"
                    value={String(getFieldValue("bodyComposition", "bmi", ""))}
                    onChange={e => updateField("bodyComposition", "bmi", parseFloat(e.target.value))}
                    placeholder="18.5" data-testid="input-bmi" />
                </div>
                <div>
                  <Label>Tour de taille (cm)</Label>
                  <Input type="number" className="mt-1"
                    value={String(getFieldValue("bodyComposition", "waistCircumference", ""))}
                    onChange={e => updateField("bodyComposition", "waistCircumference", parseFloat(e.target.value))}
                    placeholder="82" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="weightLoss"
                  checked={Boolean(getFieldValue("bodyComposition", "unintentionalWeightLoss", false))}
                  onCheckedChange={v => updateField("bodyComposition", "unintentionalWeightLoss", v)}
                  data-testid="checkbox-weightLoss"
                />
                <Label htmlFor="weightLoss">Perte de poids involontaire</Label>
              </div>
              {getBoolVal("bodyComposition", "unintentionalWeightLoss") && (
                <div>
                  <Label>Perte de poids (kg)</Label>
                  <Input type="number" className="mt-1"
                    value={String(getFieldValue("bodyComposition", "weightLossKg", ""))}
                    onChange={e => updateField("bodyComposition", "weightLossKg", parseFloat(e.target.value))}
                    placeholder="5" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="malnutrition"
                  checked={Boolean(getFieldValue("bodyComposition", "malnutritionSuspicion", false))}
                  onCheckedChange={v => updateField("bodyComposition", "malnutritionSuspicion", v)}
                />
                <Label htmlFor="malnutrition">Suspicion de dénutrition (MNA / SCREEN)</Label>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea className="mt-1" rows={2}
                  value={String(getFieldValue("bodyComposition", "notes", ""))}
                  onChange={e => updateField("bodyComposition", "notes", e.target.value)}
                  placeholder="Observations cliniques..." />
              </div>
            </CardContent>
          </>
        )}

        {/* Step 3: Muscular Function */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle>Force & Fonction Musculaire</CardTitle>
              <CardDescription>Tests de force et résistance — protocoles validés EWGSOP2</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-800">
                <strong>Grip Strength :</strong> Dynamomètre en position assise, coude à 90°. Réaliser 3 mesures, retenir la meilleure.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Force préhension dominante (kg)</Label>
                  <Input type="number" step="0.5" className="mt-1"
                    value={String(getFieldValue("muscularFunction", "gripStrengthDominant", ""))}
                    onChange={e => updateField("muscularFunction", "gripStrengthDominant", parseFloat(e.target.value))}
                    placeholder="28" data-testid="input-grip" />
                </div>
                <div>
                  <Label>Force préhension non-dominante (kg)</Label>
                  <Input type="number" step="0.5" className="mt-1"
                    value={String(getFieldValue("muscularFunction", "gripStrengthNonDominant", ""))}
                    onChange={e => updateField("muscularFunction", "gripStrengthNonDominant", parseFloat(e.target.value))}
                    placeholder="24" />
                </div>
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-800">
                <strong>Sit-to-Stand 30s :</strong> Depuis une chaise sans accoudoir, se lever et s'asseoir le plus souvent possible en 30 secondes.
              </div>
              <div>
                <Label>Sit-to-Stand 30 secondes (répétitions)</Label>
                <Input type="number" className="mt-1"
                  value={String(getFieldValue("muscularFunction", "sitToStand30s", ""))}
                  onChange={e => updateField("muscularFunction", "sitToStand30s", parseInt(e.target.value, 10))}
                  placeholder="12" data-testid="input-sts" />
              </div>
              <div>
                <Label>Risque sarcopénique (EWGSOP2)</Label>
                <Select
                  value={String(getFieldValue("muscularFunction", "sarcopeniaRisk", ""))}
                  onValueChange={v => updateField("muscularFunction", "sarcopeniaRisk", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Évaluation..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="moderate">Modéré</SelectItem>
                    <SelectItem value="high">Élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Endurance musculaire globale</Label>
                <Select
                  value={String(getFieldValue("muscularFunction", "globalMuscularEndurance", ""))}
                  onValueChange={v => updateField("muscularFunction", "globalMuscularEndurance", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Évaluation..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Faible</SelectItem>
                    <SelectItem value="below_average">Sous la moyenne</SelectItem>
                    <SelectItem value="average">Moyenne</SelectItem>
                    <SelectItem value="above_average">Au-dessus de la moyenne</SelectItem>
                    <SelectItem value="excellent">Excellente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 4: Cardio-Respiratory */}
        {currentStep === 4 && (
          <>
            <CardHeader>
              <CardTitle>Capacité Cardio-Respiratoire</CardTitle>
              <CardDescription>Test de marche 6 minutes (6MWT) et tolérance à l'effort</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-800">
                <strong>6MWT :</strong> Marche en couloir plat (30m), aussi vite que possible, sur 6 minutes. Mesurer la distance totale parcourue. Arrêt si douleur thoracique, dyspnée sévère ou vertiges.
              </div>
              <div>
                <Label>Distance parcourue en 6 minutes (m)</Label>
                <Input type="number" className="mt-1"
                  value={String(getFieldValue("cardioRespiratory", "sixMinuteWalkDistance", ""))}
                  onChange={e => updateField("cardioRespiratory", "sixMinuteWalkDistance", parseFloat(e.target.value))}
                  placeholder="450" data-testid="input-6mwt" />
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-800">
                <strong>Échelle de Borg :</strong> Perception de l'effort — 6 (aucun effort) à 20 (effort maximal). Demander immédiatement après le test.
              </div>
              <div>
                <Label>Borg Scale à l'effort ({getNumVal("cardioRespiratory", "borgScaleRating", 12)})</Label>
                <Slider
                  min={6} max={20} step={1}
                  value={[Number(getFieldValue("cardioRespiratory", "borgScaleRating", 12))]}
                  onValueChange={([v]) => updateField("cardioRespiratory", "borgScaleRating", v)}
                  className="mt-2"
                  data-testid="slider-borg"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>6 — Aucun effort</span>
                  <span>20 — Effort maximal</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>FC repos (bpm)</Label>
                  <Input type="number" className="mt-1"
                    value={String(getFieldValue("cardioRespiratory", "heartRateAtRest", ""))}
                    onChange={e => updateField("cardioRespiratory", "heartRateAtRest", parseInt(e.target.value, 10))}
                    placeholder="72" />
                </div>
                <div>
                  <Label>FC après effort (bpm)</Label>
                  <Input type="number" className="mt-1"
                    value={String(getFieldValue("cardioRespiratory", "heartRateAfterExercise", ""))}
                    onChange={e => updateField("cardioRespiratory", "heartRateAfterExercise", parseInt(e.target.value, 10))}
                    placeholder="120" />
                </div>
              </div>
              <div>
                <Label>Fatigue post-effort</Label>
                <Select
                  value={String(getFieldValue("cardioRespiratory", "postEffortFatigue", ""))}
                  onValueChange={v => updateField("cardioRespiratory", "postEffortFatigue", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Niveau..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="mild">Légère</SelectItem>
                    <SelectItem value="moderate">Modérée</SelectItem>
                    <SelectItem value="severe">Sévère</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="exerciseIntolerance"
                  checked={Boolean(getFieldValue("cardioRespiratory", "exerciseIntolerance", false))}
                  onCheckedChange={v => updateField("cardioRespiratory", "exerciseIntolerance", v)}
                  data-testid="checkbox-exerciseIntolerance"
                />
                <Label htmlFor="exerciseIntolerance">Intolérance à l'effort documentée</Label>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 5: Mobility & Balance */}
        {currentStep === 5 && (
          <>
            <CardHeader>
              <CardTitle>Mobilité & Fonction</CardTitle>
              <CardDescription>Équilibre, amplitude articulaire et risque de chute</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { field: "staticBalance", label: "Équilibre statique", options: [["poor","Faible"],["moderate","Modéré"],["good","Bon"],["excellent","Excellent"]] },
                { field: "dynamicBalance", label: "Équilibre dynamique", options: [["poor","Faible"],["moderate","Modéré"],["good","Bon"],["excellent","Excellent"]] },
                { field: "functionalRangeOfMotion", label: "Amplitude articulaire fonctionnelle", options: [["limited","Limitée"],["reduced","Réduite"],["normal","Normale"],["full","Complète"]] },
                { field: "fallRisk", label: "Risque de chute", options: [["low","Faible"],["moderate","Modéré"],["high","Élevé"]] },
              ].map(({ field, label, options }) => (
                <div key={field}>
                  <Label>{label}</Label>
                  <Select
                    value={String(getFieldValue("mobilityFunction", field, ""))}
                    onValueChange={v => updateField("mobilityFunction", field, v)}
                  >
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Évaluation..." /></SelectTrigger>
                    <SelectContent>
                      {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div>
                <Label>Notes</Label>
                <Textarea className="mt-1" rows={2}
                  value={String(getFieldValue("mobilityFunction", "notes", ""))}
                  onChange={e => updateField("mobilityFunction", "notes", e.target.value)}
                  placeholder="Observations..." />
              </div>
            </CardContent>
          </>
        )}

        {/* Step 6: Psychological */}
        {currentStep === 6 && (
          <>
            <CardHeader>
              <CardTitle>Évaluation Psychologique</CardTitle>
              <CardDescription>Motivation, image corporelle, auto-efficacité et qualité de vie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { field: "motivationLevel", label: "Motivation à l'activité physique (0-10)" },
                { field: "bodyImageAnxiety", label: "Anxiété liée à l'image corporelle (0-10)" },
                { field: "impulsivity", label: "Impulsivité (0-10)" },
                { field: "selfEfficacy", label: "Auto-efficacité (0-10)" },
                { field: "qualityOfLife", label: "Qualité de vie perçue (0-10)" },
              ].map(({ field, label }) => (
                <div key={field}>
                  <Label>{label} — {getNumVal("psychologicalStatus", field, 5)}</Label>
                  <Slider
                    min={0} max={10} step={1}
                    value={[Number(getFieldValue("psychologicalStatus", field, 5))]}
                    onValueChange={([v]) => updateField("psychologicalStatus", field, v)}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1"><span>0</span><span>10</span></div>
                </div>
              ))}
              <div>
                <Label>Détresse psychologique</Label>
                <Select
                  value={String(getFieldValue("psychologicalStatus", "psychologicalDistress", ""))}
                  onValueChange={v => updateField("psychologicalStatus", "psychologicalDistress", v)}
                >
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Niveau..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="mild">Légère</SelectItem>
                    <SelectItem value="moderate">Modérée</SelectItem>
                    <SelectItem value="severe">Sévère</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {[
                  { id: "bodyImageDisturbance", label: "Perturbation de l'image corporelle" },
                  { id: "compulsiveExercise", label: "Exercice compulsif (hyperactivité physique)" },
                ].map(({ id, label }) => (
                  <div key={id} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={Boolean(getFieldValue("psychologicalStatus", id, false))}
                      onCheckedChange={v => updateField("psychologicalStatus", id, v)}
                    />
                    <Label htmlFor={id}>{label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        )}

        {/* Step 7: Addiction & Behavior */}
        {currentStep === 7 && (
          <>
            <CardHeader>
              <CardTitle>Addiction & Comportement</CardTitle>
              <CardDescription>Craving, rechute, régulation émotionnelle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>Niveau de craving (0-10) — {getNumVal("addictionBehavior", "cravingLevel", 0)}</Label>
                <Slider
                  min={0} max={10} step={1}
                  value={[Number(getFieldValue("addictionBehavior", "cravingLevel", 0))]}
                  onValueChange={([v]) => updateField("addictionBehavior", "cravingLevel", v)}
                  className="mt-2" data-testid="slider-craving"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1"><span>0 — Aucun</span><span>10 — Intense</span></div>
              </div>
              <div>
                <Label>Régulation émotionnelle</Label>
                <Select
                  value={String(getFieldValue("addictionBehavior", "emotionalRegulation", ""))}
                  onValueChange={v => updateField("addictionBehavior", "emotionalRegulation", v)}
                >
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Évaluation..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Faible</SelectItem>
                    <SelectItem value="moderate">Modérée</SelectItem>
                    <SelectItem value="good">Bonne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {[
                  { id: "recentRelapse", label: "Rechute récente (moins de 3 mois)" },
                  { id: "effortAvoidance", label: "Évitement de l'effort" },
                  { id: "substanceCurrentUse", label: "Consommation active de substance(s)" },
                  { id: "addictionStabilized", label: "Addiction stabilisée / suivi en cours" },
                ].map(({ id, label }) => (
                  <div key={id} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={Boolean(getFieldValue("addictionBehavior", id, false))}
                      onCheckedChange={v => updateField("addictionBehavior", id, v)}
                    />
                    <Label htmlFor={id}>{label}</Label>
                  </div>
                ))}
              </div>
              <div>
                <Label>Notes cliniques</Label>
                <Textarea className="mt-1" rows={3}
                  value={String(getFieldValue("addictionBehavior", "notes", ""))}
                  onChange={e => updateField("addictionBehavior", "notes", e.target.value)}
                  placeholder="Observations comportementales..." />
              </div>
            </CardContent>
          </>
        )}
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          data-testid="button-prev"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>
        {currentStep < STEPS.length ? (
          <Button
            onClick={handleNext}
            disabled={createAssessment.isPending}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            data-testid="button-next"
          >
            Suivant
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={completeAssessment.isPending || updateAssessment.isPending}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            data-testid="button-complete"
          >
            <Check className="h-4 w-4 mr-2" />
            {completeAssessment.isPending ? "Calcul en cours..." : "Terminer et calculer les scores"}
          </Button>
        )}
      </div>
    </div>
  );
}
