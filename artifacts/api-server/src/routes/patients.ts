import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, patientsTable, assessmentsTable } from "@workspace/db";
import { CreatePatientBody, UpdatePatientBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/patients", async (req, res, next): Promise<void> => {
  try {
    const patients = await db.select().from(patientsTable).orderBy(desc(patientsTable.createdAt));
    res.json(patients);
  } catch (err) {
    next(err);
  }
});

router.post("/patients", async (req, res, next): Promise<void> => {
  try {
    const parsed = CreatePatientBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [patient] = await db.insert(patientsTable).values({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      dateOfBirth: parsed.data.dateOfBirth,
      gender: parsed.data.gender,
      height: parsed.data.height,
      weight: parsed.data.weight,
      primaryCondition: parsed.data.primaryCondition,
      secondaryConditions: parsed.data.secondaryConditions ?? [],
      medicalHistory: parsed.data.medicalHistory,
      currentMedications: parsed.data.currentMedications,
      referringDoctor: parsed.data.referringDoctor,
    }).returning();
    res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
});

router.get("/patients/:id", async (req, res, next): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id));
    if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
    res.json(patient);
  } catch (err) {
    next(err);
  }
});

router.put("/patients/:id", async (req, res, next): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const parsed = UpdatePatientBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const updateData: Record<string, unknown> = {};
    if (parsed.data.firstName !== undefined) updateData.firstName = parsed.data.firstName;
    if (parsed.data.lastName !== undefined) updateData.lastName = parsed.data.lastName;
    if (parsed.data.dateOfBirth !== undefined) updateData.dateOfBirth = parsed.data.dateOfBirth;
    if (parsed.data.gender !== undefined) updateData.gender = parsed.data.gender;
    if (parsed.data.height !== undefined) updateData.height = parsed.data.height;
    if (parsed.data.weight !== undefined) updateData.weight = parsed.data.weight;
    if (parsed.data.primaryCondition !== undefined) updateData.primaryCondition = parsed.data.primaryCondition;
    if (parsed.data.secondaryConditions !== undefined) updateData.secondaryConditions = parsed.data.secondaryConditions;
    if (parsed.data.medicalHistory !== undefined) updateData.medicalHistory = parsed.data.medicalHistory;
    if (parsed.data.currentMedications !== undefined) updateData.currentMedications = parsed.data.currentMedications;
    if (parsed.data.referringDoctor !== undefined) updateData.referringDoctor = parsed.data.referringDoctor;

    const [patient] = await db.update(patientsTable).set(updateData).where(eq(patientsTable.id, id)).returning();
    if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
    res.json(patient);
  } catch (err) {
    next(err);
  }
});

router.delete("/patients/:id", async (req, res, next): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    await db.delete(assessmentsTable).where(eq(assessmentsTable.patientId, id));
    const [patient] = await db.delete(patientsTable).where(eq(patientsTable.id, id)).returning();
    if (!patient) { res.status(404).json({ error: "Patient not found" }); return; }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
