import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, assessmentsTable, patientsTable } from "@workspace/db";
import { CreateAssessmentBody, UpdateAssessmentBody } from "@workspace/api-zod";
import { computeAssessmentScores } from "../lib/apa-scoring";

const router: IRouter = Router();

router.post("/assessments", async (req, res): Promise<void> => {
  const parsed = CreateAssessmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [assessment] = await db.insert(assessmentsTable).values({
    patientId: parsed.data.patientId,
    clinician: parsed.data.clinician,
    assessmentDate: parsed.data.assessmentDate ?? new Date().toISOString().split("T")[0],
    status: "draft",
  }).returning();
  res.status(201).json(assessment);
});

router.get("/assessments/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [assessment] = await db.select().from(assessmentsTable).where(eq(assessmentsTable.id, id));
  if (!assessment) { res.status(404).json({ error: "Assessment not found" }); return; }
  res.json(assessment);
});

router.put("/assessments/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateAssessmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.clinician !== undefined) updateData.clinician = parsed.data.clinician;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.bodyComposition !== undefined) updateData.bodyComposition = parsed.data.bodyComposition;
  if (parsed.data.muscularFunction !== undefined) updateData.muscularFunction = parsed.data.muscularFunction;
  if (parsed.data.cardioRespiratory !== undefined) updateData.cardioRespiratory = parsed.data.cardioRespiratory;
  if (parsed.data.mobilityFunction !== undefined) updateData.mobilityFunction = parsed.data.mobilityFunction;
  if (parsed.data.psychologicalStatus !== undefined) updateData.psychologicalStatus = parsed.data.psychologicalStatus;
  if (parsed.data.addictionBehavior !== undefined) updateData.addictionBehavior = parsed.data.addictionBehavior;

  if (Object.keys(updateData).length === 0) {
    const [existing] = await db.select().from(assessmentsTable).where(eq(assessmentsTable.id, id));
    if (!existing) { res.status(404).json({ error: "Assessment not found" }); return; }
    res.json(existing);
    return;
  }

  const [assessment] = await db.update(assessmentsTable).set(updateData).where(eq(assessmentsTable.id, id)).returning();
  if (!assessment) { res.status(404).json({ error: "Assessment not found" }); return; }
  res.json(assessment);
});

router.post("/assessments/:id/complete", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [assessment] = await db.select().from(assessmentsTable).where(eq(assessmentsTable.id, id));
  if (!assessment) { res.status(404).json({ error: "Assessment not found" }); return; }

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, assessment.patientId));
  const primaryCondition = patient?.primaryCondition ?? "other";

  const assessmentData = {
    bodyComposition: assessment.bodyComposition as Record<string, unknown> | undefined,
    muscularFunction: assessment.muscularFunction as Record<string, unknown> | undefined,
    cardioRespiratory: assessment.cardioRespiratory as Record<string, unknown> | undefined,
    mobilityFunction: assessment.mobilityFunction as Record<string, unknown> | undefined,
    psychologicalStatus: assessment.psychologicalStatus as Record<string, unknown> | undefined,
    addictionBehavior: assessment.addictionBehavior as Record<string, unknown> | undefined,
  };

  const { domainScores, globalScore, riskFlags, riskLevel, recommendations } = computeAssessmentScores(
    assessmentData as Parameters<typeof computeAssessmentScores>[0],
    primaryCondition
  );

  const [completed] = await db.update(assessmentsTable).set({
    status: "completed",
    globalScore,
    domainScores,
    riskLevel,
    riskFlags,
    recommendations,
  }).where(eq(assessmentsTable.id, id)).returning();

  res.json(completed);
});

export default router;
