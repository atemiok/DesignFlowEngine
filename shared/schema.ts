import { pgTable, text, serial, integer, boolean, timestamp, numeric, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("staff"),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(),
  name: text("name").notNull(),
  idNumber: text("id_number").notNull(),
  gender: text("gender").notNull(),
  dob: text("dob").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  insurance: text("insurance"),
  serviceType: text("service_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicalHistory = pgTable("medical_history", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  allergies: text("allergies"),
  conditions: text("conditions"),
  medications: text("medications"),
  notes: text("notes"),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  date: text("date").notNull(),
  time: text("time").notNull(),
  treatment: text("treatment").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
});

export const treatments = pgTable("treatments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  date: text("date").notNull(),
  treatmentType: text("treatment_type").notNull(),
  tooth: text("tooth"),
  notes: text("notes"),
  cost: numeric("cost").notNull(),
});

export const dentalChart = pgTable("dental_chart", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  toothNumber: text("tooth_number").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  treatmentId: integer("treatment_id").references(() => treatments.id),
  amount: numeric("amount").notNull(),
  date: text("date").notNull(),
  method: text("method").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  name: true,
  idNumber: true,
  gender: true,
  dob: true,
  phone: true,
  email: true,
  address: true,
  insurance: true,
  serviceType: true,
});

export const insertMedicalHistorySchema = createInsertSchema(medicalHistory).pick({
  patientId: true,
  allergies: true,
  conditions: true,
  medications: true,
  notes: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  patientId: true,
  doctorId: true,
  date: true,
  time: true,
  treatment: true,
  status: true,
  notes: true,
});

export const insertTreatmentSchema = createInsertSchema(treatments).pick({
  patientId: true,
  doctorId: true,
  date: true,
  treatmentType: true,
  tooth: true,
  notes: true,
  cost: true,
});

export const insertDentalChartSchema = createInsertSchema(dentalChart).pick({
  patientId: true,
  toothNumber: true,
  status: true,
  notes: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  patientId: true,
  treatmentId: true,
  amount: true,
  date: true,
  method: true,
  status: true,
  notes: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

export type InsertMedicalHistory = z.infer<typeof insertMedicalHistorySchema>;
export type MedicalHistory = typeof medicalHistory.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;
export type Treatment = typeof treatments.$inferSelect;

export type InsertDentalChart = z.infer<typeof insertDentalChartSchema>;
export type DentalChart = typeof dentalChart.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
