import { 
  users, type User, type InsertUser,
  patients, type Patient, type InsertPatient,
  medicalHistory, type MedicalHistory, type InsertMedicalHistory,
  appointments, type Appointment, type InsertAppointment,
  treatments, type Treatment, type InsertTreatment,
  dentalChart, type DentalChart, type InsertDentalChart,
  payments, type Payment, type InsertPayment
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patient operations
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;
  searchPatients(query: string): Promise<Patient[]>;
  
  // Medical History operations
  getMedicalHistory(patientId: number): Promise<MedicalHistory | undefined>;
  createMedicalHistory(medicalHistory: InsertMedicalHistory): Promise<MedicalHistory>;
  updateMedicalHistory(id: number, medicalHistory: Partial<InsertMedicalHistory>): Promise<MedicalHistory | undefined>;
  
  // Appointment operations
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Treatment operations
  getTreatments(): Promise<Treatment[]>;
  getTreatment(id: number): Promise<Treatment | undefined>;
  getTreatmentsByPatient(patientId: number): Promise<Treatment[]>;
  createTreatment(treatment: InsertTreatment): Promise<Treatment>;
  updateTreatment(id: number, treatment: Partial<InsertTreatment>): Promise<Treatment | undefined>;
  deleteTreatment(id: number): Promise<boolean>;
  
  // Dental Chart operations
  getDentalChart(patientId: number): Promise<DentalChart[]>;
  createDentalChartEntry(entry: InsertDentalChart): Promise<DentalChart>;
  updateDentalChartEntry(id: number, entry: Partial<InsertDentalChart>): Promise<DentalChart | undefined>;
  
  // Payment operations
  getPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByPatient(patientId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;
}

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  // Patient methods
  async getPatients(): Promise<Patient[]> {
    return db.select().from(patients);
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const result = await db.select().from(patients).where(eq(patients.id, id));
    return result[0];
  }

  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    const result = await db.select().from(patients).where(eq(patients.patientId, patientId));
    return result[0];
  }

  async createPatient(patientData: InsertPatient): Promise<Patient> {
    const result = await db.insert(patients).values(patientData).returning();
    return result[0];
  }

  async updatePatient(id: number, patientData: Partial<InsertPatient>): Promise<Patient | undefined> {
    const result = await db.update(patients)
      .set(patientData)
      .where(eq(patients.id, id))
      .returning();
    return result[0];
  }

  async deletePatient(id: number): Promise<boolean> {
    const result = await db.delete(patients).where(eq(patients.id, id)).returning();
    return result.length > 0;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return db.select().from(patients).where(
      like(patients.name, `%${query}%`)
    );
  }

  // Medical History methods
  async getMedicalHistory(patientId: number): Promise<MedicalHistory | undefined> {
    const result = await db.select().from(medicalHistory).where(eq(medicalHistory.patientId, patientId));
    return result[0];
  }

  async createMedicalHistory(medicalHistoryData: InsertMedicalHistory): Promise<MedicalHistory> {
    const result = await db.insert(medicalHistory).values(medicalHistoryData).returning();
    return result[0];
  }

  async updateMedicalHistory(id: number, medicalHistoryData: Partial<InsertMedicalHistory>): Promise<MedicalHistory | undefined> {
    const result = await db.update(medicalHistory)
      .set(medicalHistoryData)
      .where(eq(medicalHistory.id, id))
      .returning();
    return result[0];
  }

  // Appointment methods
  async getAppointments(): Promise<Appointment[]> {
    return db.select().from(appointments);
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id));
    return result[0];
  }

  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return db.select().from(appointments).where(eq(appointments.patientId, patientId));
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return db.select().from(appointments).where(eq(appointments.date, date));
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointmentData).returning();
    return result[0];
  }

  async updateAppointment(id: number, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const result = await db.update(appointments)
      .set(appointmentData)
      .where(eq(appointments.id, id))
      .returning();
    return result[0];
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id)).returning();
    return result.length > 0;
  }

  // Treatment methods
  async getTreatments(): Promise<Treatment[]> {
    return db.select().from(treatments);
  }

  async getTreatment(id: number): Promise<Treatment | undefined> {
    const result = await db.select().from(treatments).where(eq(treatments.id, id));
    return result[0];
  }

  async getTreatmentsByPatient(patientId: number): Promise<Treatment[]> {
    return db.select().from(treatments).where(eq(treatments.patientId, patientId));
  }

  async createTreatment(treatmentData: InsertTreatment): Promise<Treatment> {
    const result = await db.insert(treatments).values(treatmentData).returning();
    return result[0];
  }

  async updateTreatment(id: number, treatmentData: Partial<InsertTreatment>): Promise<Treatment | undefined> {
    const result = await db.update(treatments)
      .set(treatmentData)
      .where(eq(treatments.id, id))
      .returning();
    return result[0];
  }

  async deleteTreatment(id: number): Promise<boolean> {
    const result = await db.delete(treatments).where(eq(treatments.id, id)).returning();
    return result.length > 0;
  }

  // Dental Chart methods
  async getDentalChart(patientId: number): Promise<DentalChart[]> {
    return db.select().from(dentalChart).where(eq(dentalChart.patientId, patientId));
  }

  async createDentalChartEntry(entryData: InsertDentalChart): Promise<DentalChart> {
    const result = await db.insert(dentalChart).values(entryData).returning();
    return result[0];
  }

  async updateDentalChartEntry(id: number, entryData: Partial<InsertDentalChart>): Promise<DentalChart | undefined> {
    const result = await db.update(dentalChart)
      .set(entryData)
      .where(eq(dentalChart.id, id))
      .returning();
    return result[0];
  }

  // Payment methods
  async getPayments(): Promise<Payment[]> {
    return db.select().from(payments);
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id));
    return result[0];
  }

  async getPaymentsByPatient(patientId: number): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.patientId, patientId));
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(paymentData).returning();
    return result[0];
  }

  async updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const result = await db.update(payments)
      .set(paymentData)
      .where(eq(payments.id, id))
      .returning();
    return result[0];
  }

  async deletePayment(id: number): Promise<boolean> {
    const result = await db.delete(payments).where(eq(payments.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
