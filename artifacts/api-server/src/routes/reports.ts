import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, patientsTable, assessmentsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res, next): Promise<void> => {
  try {
    const patients = await db.select().from(patientsTable);
    const assessments = await db
      .select()
      .from(assessmentsTable)
      .orderBy(desc(assessmentsTable.createdAt))
      .limit(10);

    const completedAssessments = await db
      .select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.status, "completed"));

    let redAlertCount = 0;
    let orangeAlertCount = 0;
    let greenCount = 0;
    let totalScore = 0;
    let scoredCount = 0;

    for (const a of completedAssessments) {
      if (a.riskLevel === "red") redAlertCount++;
      else if (a.riskLevel === "orange") orangeAlertCount++;
      else greenCount++;
      if (a.globalScore !== null) {
        totalScore += a.globalScore;
        scoredCount++;
      }
    }

    const conditionMap: Record<string, number> = {};
    for (const p of patients) {
      conditionMap[p.primaryCondition] =
        (conditionMap[p.primaryCondition] ?? 0) + 1;
    }
    const conditionBreakdown = Object.entries(conditionMap).map(
      ([condition, count]) => ({ condition, count }),
    );

    res.json({
      totalPatients: patients.length,
      totalAssessments: assessments.length,
      redAlertCount,
      orangeAlertCount,
      greenCount,
      averageGlobalScore:
        scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0,
      conditionBreakdown,
      recentAssessments: assessments,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/risk-summary", async (req, res, next): Promise<void> => {
  try {
    const allPatients = await db.select().from(patientsTable);
    const latestAssessmentsByPatient: Record<number, { riskLevel: string }> =
      {};

    const assessments = await db
      .select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.status, "completed"))
      .orderBy(desc(assessmentsTable.createdAt));

    for (const a of assessments) {
      if (!latestAssessmentsByPatient[a.patientId] && a.riskLevel) {
        latestAssessmentsByPatient[a.patientId] = { riskLevel: a.riskLevel };
      }
    }

    const red: typeof allPatients = [];
    const orange: typeof allPatients = [];
    const green: typeof allPatients = [];

    for (const patient of allPatients) {
      const latestRisk = latestAssessmentsByPatient[patient.id]?.riskLevel;
      if (latestRisk === "red") red.push(patient);
      else if (latestRisk === "orange") orange.push(patient);
      else green.push(patient);
    }

    res.json({ red, orange, green });
  } catch (err) {
    next(err);
  }
});

export default router;
