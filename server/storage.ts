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
    
    // Add initial doctor user with hashed password
    this.createUser({
      username: 'doctor',
      password: '$2a$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX5YxX', // hashed 'password'
      name: 'Dr. Roberts',
      email: 'dr.roberts@dentalcare.com',
      phone: '+254712345678',
      role: 'doctor'
    });
    
    // Add initial data for demonstration
    this.initializeData().catch(console.error);
  }
  
  private async initializeData() {
    // Create sample patients
    const patient1 = await this.createPatient({
      name: 'Jane Doe',
      idNumber: '12345678',
      gender: 'Female',
      dob: '05/12/1985',
      phone: '+254712345678',
      email: 'jane.doe@example.com',
      address: '123 Main St, Anytown',
      insurance: 'DentalCare Plus',
      service: 'checkup'
    });
    
    const patient2 = await this.createPatient({
      name: 'Mike Smith',
      idNumber: '87654321',
      gender: 'Male',
      dob: '10/24/1978',
      phone: '+254798765432',
      email: 'mike.smith@example.com',
      address: '456 Oak Ave, Somecity',
      insurance: 'Dental Shield',
      service: 'cleaning'
    });
    
    const patient3 = await this.createPatient({
      name: 'Alice Johnson',
      idNumber: '24681357',
      gender: 'Female',
      dob: '03/15/1990',
      phone: '+254755555555',
      email: 'alice.johnson@example.com',
      address: '789 Pine Rd, Othertown',
      insurance: 'DentiHealth',
      service: 'whitening'
    });
    
    // Create medical histories
    await this.createMedicalHistory({
      patientId: patient1.id,
      allergies: 'Penicillin',
      conditions: 'Hypertension',
      medications: 'Lisinopril',
      notes: 'Patient has controlled hypertension.'
    });
    
    // Create appointments
    const today = new Date().toISOString().split('T')[0];
    
    await this.createAppointment({
      patientId: patient1.id,
      doctorId: 1, // Dr. Roberts
      date: today,
      time: '09:00 AM',
      treatment: 'Dental Cleaning',
      status: 'checked-in',
      notes: 'Regular cleaning appointment'
    });
    
    await this.createAppointment({
      patientId: patient2.id,
      doctorId: 1,
      date: today,
      time: '10:30 AM',
      treatment: 'Root Canal',
      status: 'waiting',
      notes: 'Patient experiencing pain'
    });
    
    await this.createAppointment({
      patientId: patient3.id,
      doctorId: 1,
      date: today,
      time: '11:45 AM',
      treatment: 'Consultation',
      status: 'scheduled',
      notes: 'Initial consultation'
    });
    
    // Create treatments
    await this.createTreatment({
      patientId: patient1.id,
      doctorId: 1,
      date: '2023-03-15',
      treatmentType: 'Dental Cleaning',
      notes: 'Routine cleaning and fluoride treatment.',
      cost: '120',
      tooth: null
    });
    
    await this.createTreatment({
      patientId: patient2.id,
      doctorId: 1,
      date: '2023-01-22',
      treatmentType: 'Cavity Filling',
      tooth: '18',
      notes: 'Composite filling on tooth #18.',
      cost: '200'
    });
    
    // Create dental chart entries
    await this.createDentalChartEntry({
      patientId: patient1.id,
      toothNumber: '1',
      status: 'needs-treatment',
      notes: 'Wisdom tooth extraction recommended.'
    });
    
    await this.createDentalChartEntry({
      patientId: patient1.id,
      toothNumber: '14',
      status: 'treatment-scheduled',
      notes: 'Root canal treatment scheduled for Apr 10.'
    });
    
    await this.createDentalChartEntry({
      patientId: patient1.id,
      toothNumber: '18',
      status: 'treated',
      notes: 'Composite filling completed Jan 22.'
    });
    
    // Create payments
    await this.createPayment({
      patientId: patient1.id,
      treatmentId: 1,
      amount: '120',
      date: '2023-03-15',
      method: 'credit',
      status: 'completed',
      notes: 'Payment for dental cleaning'
    });
    
    await this.createPayment({
      patientId: patient2.id,
      treatmentId: 2,
      amount: '200',
      date: '2023-01-22',
      method: 'insurance',
      status: 'completed',
      notes: 'Payment for cavity filling'
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
    const user: User = {
      id: this.userId++,
      name: insertUser.name,
      phone: insertUser.phone,
      email: insertUser.email,
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role ?? "patient" // Provide default role
    };
    this.users.set(user.id, user);
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
      (patient) => patient.idNumber === patientId
    );
  }
  
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const patient: Patient = {
      id: this.patientId++,
      name: insertPatient.name,
      idNumber: insertPatient.idNumber,
      gender: insertPatient.gender,
      dob: insertPatient.dob,
      phone: insertPatient.phone,
      email: insertPatient.email,
      address: insertPatient.address,
      insurance: insertPatient.insurance,
      service: insertPatient.service
    };
    this.patients.set(patient.id, patient);
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
        patient.idNumber.toLowerCase().includes(lowercaseQuery) ||
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
    const medicalHistory: MedicalHistory = {
      id: this.medicalHistoryId++,
      patientId: insertMedicalHistory.patientId,
      notes: insertMedicalHistory.notes ?? null,
      allergies: insertMedicalHistory.allergies ?? null,
      conditions: insertMedicalHistory.conditions ?? null,
      medications: insertMedicalHistory.medications ?? null
    };
    this.medicalHistories.set(medicalHistory.id, medicalHistory);
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
    const appointment: Appointment = {
      id: this.appointmentId++,
      patientId: insertAppointment.patientId,
      doctorId: insertAppointment.doctorId,
      date: insertAppointment.date,
      time: insertAppointment.time,
      treatment: insertAppointment.treatment,
      status: insertAppointment.status ?? "scheduled",
      notes: insertAppointment.notes ?? null
    };
    this.appointments.set(appointment.id, appointment);
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
    const treatment: Treatment = {
      id: this.treatmentId++,
      patientId: insertTreatment.patientId,
      doctorId: insertTreatment.doctorId,
      date: insertTreatment.date,
      treatmentType: insertTreatment.treatmentType,
      notes: insertTreatment.notes ?? null,
      tooth: insertTreatment.tooth ?? null,
      cost: insertTreatment.cost
    };
    this.treatments.set(treatment.id, treatment);
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
    const entry: DentalChart = {
      id: this.dentalChartId++,
      patientId: insertEntry.patientId,
      toothNumber: insertEntry.toothNumber,
      status: insertEntry.status,
      notes: insertEntry.notes ?? null,
      updatedAt: new Date()
    };
    this.dentalCharts.set(entry.id, entry);
    return entry;
  }
  
  async updateDentalChartEntry(id: number, update: Partial<InsertDentalChart>): Promise<DentalChart | undefined> {
    const entry = this.dentalCharts.get(id);
    if (!entry) return undefined;
    
    const updatedEntry: DentalChart = {
      ...entry,
      ...update,
      updatedAt: new Date()
    };
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
    const now = new Date();
    const payment: Payment = {
      id: this.paymentId++,
      patientId: insertPayment.patientId,
      treatmentId: insertPayment.treatmentId ?? null,
      amount: insertPayment.amount,
      date: insertPayment.date,
      method: insertPayment.method,
      status: insertPayment.status,
      notes: insertPayment.notes ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.payments.set(payment.id, payment);
    return payment;
  }
  
  async updatePayment(id: number, update: Partial<InsertPayment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment: Payment = {
      ...payment,
      ...update,
      updatedAt: new Date()
    };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  async deletePayment(id: number): Promise<boolean> {
    return this.payments.delete(id);
  }
}

export const storage = new MemStorage();
