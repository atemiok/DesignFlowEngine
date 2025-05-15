import { 
  users, type User, type InsertUser,
  patients, type Patient, type InsertPatient,
  medicalHistory, type MedicalHistory, type InsertMedicalHistory,
  appointments, type Appointment, type InsertAppointment,
  treatments, type Treatment, type InsertTreatment,
  dentalChart, type DentalChart, type InsertDentalChart,
  payments, type Payment, type InsertPayment
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private medicalHistories: Map<number, MedicalHistory>;
  private appointments: Map<number, Appointment>;
  private treatments: Map<number, Treatment>;
  private dentalCharts: Map<number, DentalChart>;
  private payments: Map<number, Payment>;
  
  private userId: number;
  private patientId: number;
  private medicalHistoryId: number;
  private appointmentId: number;
  private treatmentId: number;
  private dentalChartId: number;
  private paymentId: number;
  
  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.medicalHistories = new Map();
    this.appointments = new Map();
    this.treatments = new Map();
    this.dentalCharts = new Map();
    this.payments = new Map();
    
    this.userId = 1;
    this.patientId = 1;
    this.medicalHistoryId = 1;
    this.appointmentId = 1;
    this.treatmentId = 1;
    this.dentalChartId = 1;
    this.paymentId = 1;
    
    // Add initial doctor user
    this.createUser({
      username: 'doctor',
      password: 'password',
      name: 'Dr. Roberts',
      role: 'doctor'
    });
    
    // Add initial data for demonstration
    this.initializeData();
  }
  
  private initializeData() {
    // Create sample patients
    const patient1 = this.createPatient({
      name: 'Jane Doe',
      dob: '05/12/1985',
      phone: '(555) 123-4567',
      email: 'jane.doe@example.com',
      address: '123 Main St, Anytown',
      insurance: 'DentalCare Plus'
    });
    
    const patient2 = this.createPatient({
      name: 'Mike Smith',
      dob: '10/24/1978',
      phone: '(555) 987-6543',
      email: 'mike.smith@example.com',
      address: '456 Oak Ave, Somecity',
      insurance: 'Dental Shield'
    });
    
    const patient3 = this.createPatient({
      name: 'Alice Johnson',
      dob: '03/15/1990',
      phone: '(555) 555-5555',
      email: 'alice.johnson@example.com',
      address: '789 Pine Rd, Othertown',
      insurance: 'DentiHealth'
    });
    
    // Create medical histories
    this.createMedicalHistory({
      patientId: patient1.id,
      allergies: 'Penicillin',
      conditions: 'Hypertension',
      medications: 'Lisinopril',
      notes: 'Patient has controlled hypertension.'
    });
    
    // Create appointments
    const today = new Date().toISOString().split('T')[0];
    
    this.createAppointment({
      patientId: patient1.id,
      doctorId: 1, // Dr. Roberts
      date: today,
      time: '09:00 AM',
      treatment: 'Dental Cleaning',
      status: 'checked-in',
      notes: 'Regular cleaning appointment'
    });
    
    this.createAppointment({
      patientId: patient2.id,
      doctorId: 1,
      date: today,
      time: '10:30 AM',
      treatment: 'Root Canal',
      status: 'waiting',
      notes: 'Patient experiencing pain'
    });
    
    this.createAppointment({
      patientId: patient3.id,
      doctorId: 1,
      date: today,
      time: '11:45 AM',
      treatment: 'Consultation',
      status: 'scheduled',
      notes: 'Initial consultation'
    });
    
    // Create treatments
    this.createTreatment({
      patientId: patient1.id,
      doctorId: 1,
      date: '2023-03-15',
      treatmentType: 'Dental Cleaning',
      notes: 'Routine cleaning and fluoride treatment.',
      cost: 120
    });
    
    this.createTreatment({
      patientId: patient2.id,
      doctorId: 1,
      date: '2023-01-22',
      treatmentType: 'Cavity Filling',
      tooth: '18',
      notes: 'Composite filling on tooth #18.',
      cost: 200
    });
    
    // Create dental chart entries
    this.createDentalChartEntry({
      patientId: patient1.id,
      toothNumber: '1',
      status: 'needs-treatment',
      notes: 'Wisdom tooth extraction recommended.'
    });
    
    this.createDentalChartEntry({
      patientId: patient1.id,
      toothNumber: '14',
      status: 'treatment-scheduled',
      notes: 'Root canal treatment scheduled for Apr 10.'
    });
    
    this.createDentalChartEntry({
      patientId: patient1.id,
      toothNumber: '18',
      status: 'treated',
      notes: 'Composite filling completed Jan 22.'
    });
    
    // Create payments
    this.createPayment({
      patientId: patient1.id,
      treatmentId: 1,
      amount: 120,
      date: '2023-03-15',
      method: 'credit',
      status: 'completed',
      notes: 'Payment for dental cleaning'
    });
    
    this.createPayment({
      patientId: patient2.id,
      treatmentId: 2,
      amount: 200,
      date: '2023-01-22',
      method: 'insurance',
      status: 'completed',
      notes: 'Insurance covered 80%'
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Patient methods
  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }
  
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }
  
  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.patientId === patientId
    );
  }
  
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.patientId++;
    const patientId = `P-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;
    const createdAt = new Date().toISOString();
    const patient: Patient = { ...insertPatient, id, patientId, createdAt };
    this.patients.set(id, patient);
    return patient;
  }
  
  async updatePatient(id: number, patientUpdate: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient = { ...patient, ...patientUpdate };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }
  
  async deletePatient(id: number): Promise<boolean> {
    return this.patients.delete(id);
  }
  
  async searchPatients(query: string): Promise<Patient[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.patients.values()).filter(
      (patient) => 
        patient.name.toLowerCase().includes(lowercaseQuery) ||
        patient.patientId.toLowerCase().includes(lowercaseQuery) ||
        patient.phone.includes(query) ||
        patient.email.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  // Medical History methods
  async getMedicalHistory(patientId: number): Promise<MedicalHistory | undefined> {
    return Array.from(this.medicalHistories.values()).find(
      (history) => history.patientId === patientId
    );
  }
  
  async createMedicalHistory(insertMedicalHistory: InsertMedicalHistory): Promise<MedicalHistory> {
    const id = this.medicalHistoryId++;
    const medicalHistory: MedicalHistory = { ...insertMedicalHistory, id };
    this.medicalHistories.set(id, medicalHistory);
    return medicalHistory;
  }
  
  async updateMedicalHistory(id: number, update: Partial<InsertMedicalHistory>): Promise<MedicalHistory | undefined> {
    const medicalHistory = this.medicalHistories.get(id);
    if (!medicalHistory) return undefined;
    
    const updatedMedicalHistory = { ...medicalHistory, ...update };
    this.medicalHistories.set(id, updatedMedicalHistory);
    return updatedMedicalHistory;
  }
  
  // Appointment methods
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }
  
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientId === patientId
    );
  }
  
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.date === date
    );
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentId++;
    const appointment: Appointment = { ...insertAppointment, id };
    this.appointments.set(id, appointment);
    return appointment;
  }
  
  async updateAppointment(id: number, update: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...update };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }
  
  // Treatment methods
  async getTreatments(): Promise<Treatment[]> {
    return Array.from(this.treatments.values());
  }
  
  async getTreatment(id: number): Promise<Treatment | undefined> {
    return this.treatments.get(id);
  }
  
  async getTreatmentsByPatient(patientId: number): Promise<Treatment[]> {
    return Array.from(this.treatments.values()).filter(
      (treatment) => treatment.patientId === patientId
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createTreatment(insertTreatment: InsertTreatment): Promise<Treatment> {
    const id = this.treatmentId++;
    const treatment: Treatment = { ...insertTreatment, id };
    this.treatments.set(id, treatment);
    return treatment;
  }
  
  async updateTreatment(id: number, update: Partial<InsertTreatment>): Promise<Treatment | undefined> {
    const treatment = this.treatments.get(id);
    if (!treatment) return undefined;
    
    const updatedTreatment = { ...treatment, ...update };
    this.treatments.set(id, updatedTreatment);
    return updatedTreatment;
  }
  
  async deleteTreatment(id: number): Promise<boolean> {
    return this.treatments.delete(id);
  }
  
  // Dental Chart methods
  async getDentalChart(patientId: number): Promise<DentalChart[]> {
    return Array.from(this.dentalCharts.values()).filter(
      (entry) => entry.patientId === patientId
    );
  }
  
  async createDentalChartEntry(insertEntry: InsertDentalChart): Promise<DentalChart> {
    const id = this.dentalChartId++;
    const updatedAt = new Date().toISOString();
    const entry: DentalChart = { ...insertEntry, id, updatedAt };
    this.dentalCharts.set(id, entry);
    return entry;
  }
  
  async updateDentalChartEntry(id: number, update: Partial<InsertDentalChart>): Promise<DentalChart | undefined> {
    const entry = this.dentalCharts.get(id);
    if (!entry) return undefined;
    
    const updatedAt = new Date().toISOString();
    const updatedEntry = { ...entry, ...update, updatedAt };
    this.dentalCharts.set(id, updatedEntry);
    return updatedEntry;
  }
  
  // Payment methods
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }
  
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentsByPatient(patientId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.patientId === patientId
    );
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const payment: Payment = { ...insertPayment, id };
    this.payments.set(id, payment);
    return payment;
  }
  
  async updatePayment(id: number, update: Partial<InsertPayment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...update };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  async deletePayment(id: number): Promise<boolean> {
    return this.payments.delete(id);
  }
}

export const storage = new MemStorage();
