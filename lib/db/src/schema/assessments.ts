import { pgTable, serial, integer, text, real, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assessmentsTable = pgTable("assessments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  status: text("status").notNull().default("draft"),
  assessmentDate: text("assessment_date"),
  clinician: text("clinician"),
  bodyComposition: jsonb("body_composition"),
  muscularFunction: jsonb("muscular_function"),
  cardioRespiratory: jsonb("cardio_respiratory"),
  mobilityFunction: jsonb("mobility_function"),
  psychologicalStatus: jsonb("psychological_status"),
  addictionBehavior: jsonb("addiction_behavior"),
  globalScore: real("global_score"),
  domainScores: jsonb("domain_scores"),
  riskLevel: text("risk_level"),
  riskFlags: text("risk_flags").array().default([]),
  recommendations: jsonb("recommendations"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAssessmentSchema = createInsertSchema(assessmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessmentsTable.$inferSelect;
