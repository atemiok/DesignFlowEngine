// User types
export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export type InsertUser = Omit<User, 'id'>;

// Patient types
export interface Patient {
  id: number;
  name: string;
  idNumber: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  insurance: string;
  service: string;
}

export type InsertPatient = Omit<Patient, 'id'>;

// Medical History types
export interface MedicalHistory {
  id: number;
  patientId: number;
  allergies: string | null;
  conditions: string | null;
  medications: string | null;
  notes: string | null;
}

export type InsertMedicalHistory = Omit<MedicalHistory, 'id'>;

// Appointment types
export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  time: string;
  treatment: string;
  status: string;
  notes: string | null;
}

export type InsertAppointment = Omit<Appointment, 'id'>;

// Treatment types
export interface Treatment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  treatmentType: string;
  notes: string | null;
  tooth: string | null;
  cost: string;
}

export type InsertTreatment = Omit<Treatment, 'id'>;

// Dental Chart types
export interface DentalChart {
  id: number;
  patientId: number;
  toothNumber: string;
  status: string;
  notes: string | null;
  updatedAt: Date | null;
}

export type InsertDentalChart = Omit<DentalChart, 'id' | 'updatedAt'>;

// Payment types
export interface Payment {
  id: number;
  patientId: number;
  treatmentId: number | null;
  amount: string;
  date: string;
  method: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertPayment = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;

// In-memory storage arrays
export const users: User[] = [];
export const patients: Patient[] = [];
export const medicalHistory: MedicalHistory[] = [];
export const appointments: Appointment[] = [];
export const treatments: Treatment[] = [];
export const dentalChart: DentalChart[] = [];
export const payments: Payment[] = []; 