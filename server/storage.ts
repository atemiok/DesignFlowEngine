// Data storage arrays
const users: User[] = [];
const medicalRecords: MedicalRecord[] = [];
const appointments: Appointment[] = [];
const treatments: Treatment[] = [];
const toothStatuses: ToothStatus[] = [];
const payments: Payment[] = [];

// Update the User interface
interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  role: string;
}

// Update the MedicalRecord interface
interface MedicalRecord {
  id: number;
  patientId: number;
  notes: string | null;
  allergies: string | null;
  conditions: string | null;
  medications: string | null;
}

// Update the Appointment interface
interface Appointment {
  id: number;
  date: string;
  patientId: number;
  doctorId: number;
  time: string;
  treatment: string;
  status: string;
  notes: string | null;
}

// Update the Treatment interface
interface Treatment {
  id: number;
  date: string;
  patientId: number;
  doctorId: number;
  treatmentType: string;
  cost: string;
  notes: string | null;
  tooth: string | null;
}

// Update the ToothStatus interface
interface ToothStatus {
  id: number;
  patientId: number;
  updatedAt: Date | null;
  status: string;
  notes: string | null;
  toothNumber: string;
}

// Update the Payment interface
interface Payment {
  id: number;
  date: string;
  patientId: number;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  notes: string | null;
  treatmentId: number | null;
  amount: string;
  paymentMethod: string;
}

// Update the createUser function
export function createUser(user: Omit<User, "id">): User {
  const id = users.length + 1;
  const newUser = { ...user, id, role: user.role || "patient" };
  users.push(newUser);
  return newUser;
}

// Update the createMedicalRecord function
export function createMedicalRecord(record: Omit<MedicalRecord, "id">): MedicalRecord {
  const id = medicalRecords.length + 1;
  const newRecord = {
    ...record,
    id,
    notes: record.notes || null,
    allergies: record.allergies || null,
    conditions: record.conditions || null,
    medications: record.medications || null
  };
  medicalRecords.push(newRecord);
  return newRecord;
}

// Update the createAppointment function
export function createAppointment(appointment: Omit<Appointment, "id">): Appointment {
  const id = appointments.length + 1;
  const newAppointment = {
    ...appointment,
    id,
    status: appointment.status || "scheduled",
    notes: appointment.notes || null
  };
  appointments.push(newAppointment);
  return newAppointment;
}

// Update the createTreatment function
export function createTreatment(treatment: Omit<Treatment, "id">): Treatment {
  const id = treatments.length + 1;
  const newTreatment = {
    ...treatment,
    id,
    notes: treatment.notes || null,
    tooth: treatment.tooth || null
  };
  treatments.push(newTreatment);
  return newTreatment;
}

// Update the createToothStatus function
export function createToothStatus(status: Omit<ToothStatus, "id">): ToothStatus {
  const id = toothStatuses.length + 1;
  const newStatus = {
    ...status,
    id,
    updatedAt: status.updatedAt ? new Date(status.updatedAt) : new Date()
  };
  toothStatuses.push(newStatus);
  return newStatus;
}

// Update the createPayment function
export function createPayment(payment: Omit<Payment, "id" | "createdAt" | "updatedAt">): Payment {
  const id = payments.length + 1;
  const now = new Date();
  const newPayment = {
    ...payment,
    id,
    createdAt: now,
    updatedAt: now,
    notes: payment.notes || null,
    treatmentId: payment.treatmentId || null
  };
  payments.push(newPayment);
  return newPayment;
} 