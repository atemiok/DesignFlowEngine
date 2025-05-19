import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPatientSchema,
  insertMedicalHistorySchema,
  insertAppointmentSchema,
  insertTreatmentSchema,
  insertDentalChartSchema,
  insertPaymentSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error('Unexpected error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  };

  // AUTH ROUTES
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        console.log('Login attempt with missing credentials:', { username: !!username, password: !!password });
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      console.log('Attempting login for username:', username);
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        console.log('Login failed: User not found for username:', username);
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      console.log('User found, comparing passwords');
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.log('Login failed: Invalid password for username:', username);
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      console.log('Login successful for username:', username);
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      console.log('Registration attempt with data:', { ...req.body, password: '[REDACTED]' });
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        console.log('Registration failed: Username already exists:', userData.username);
        return res.status(400).json({ message: 'Username already exists' });
      }

      console.log('Hashing password for new user:', userData.username);
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      console.log('Creating new user:', userData.username);
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      console.log('Registration successful for username:', userData.username);
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.log('Validation error details:', validationError.message);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // PATIENT ROUTES
  app.get('/api/patients', async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (query) {
        const patients = await storage.searchPatients(query);
        return res.json(patients);
      }
      
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      console.error('Error getting patients:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/patients/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }
      
      const patient = await storage.getPatient(id);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      res.json(patient);
    } catch (error) {
      console.error('Error getting patient:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/patients', async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.put('/api/patients/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }
      
      const patientData = insertPatientSchema.partial().parse(req.body);
      const updatedPatient = await storage.updatePatient(id, patientData);
      
      if (!updatedPatient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      res.json(updatedPatient);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.delete('/api/patients/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }
      
      const success = await storage.deletePatient(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting patient:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // MEDICAL HISTORY ROUTES
  app.get('/api/patients/:id/medical-history', async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      
      if (isNaN(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }
      
      const medicalHistory = await storage.getMedicalHistory(patientId);
      
      if (!medicalHistory) {
        return res.status(404).json({ message: 'Medical history not found' });
      }
      
      res.json(medicalHistory);
    } catch (error) {
      console.error('Error getting medical history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/medical-history', async (req, res) => {
    try {
      const medicalHistoryData = insertMedicalHistorySchema.parse(req.body);
      const medicalHistory = await storage.createMedicalHistory(medicalHistoryData);
      res.status(201).json(medicalHistory);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.put('/api/medical-history/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid medical history ID' });
      }
      
      const medicalHistoryData = insertMedicalHistorySchema.partial().parse(req.body);
      const updatedMedicalHistory = await storage.updateMedicalHistory(id, medicalHistoryData);
      
      if (!updatedMedicalHistory) {
        return res.status(404).json({ message: 'Medical history not found' });
      }
      
      res.json(updatedMedicalHistory);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // APPOINTMENT ROUTES
  app.get('/api/appointments', async (req, res) => {
    try {
      const date = req.query.date as string;
      
      if (date) {
        const appointments = await storage.getAppointmentsByDate(date);
        return res.json(appointments);
      }
      
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error('Error getting appointments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/patients/:id/appointments', async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      
      if (isNaN(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }
      
      const appointments = await storage.getAppointmentsByPatient(patientId);
      res.json(appointments);
    } catch (error) {
      console.error('Error getting patient appointments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/appointments', async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.put('/api/appointments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }
      
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      const updatedAppointment = await storage.updateAppointment(id, appointmentData);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.delete('/api/appointments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }
      
      const success = await storage.deleteAppointment(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // TREATMENT ROUTES
  app.get('/api/treatments', async (req, res) => {
    try {
      const treatments = await storage.getTreatments();
      res.json(treatments);
    } catch (error) {
      console.error('Error getting treatments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/patients/:id/treatments', async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      
      if (isNaN(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }
      
      const treatments = await storage.getTreatmentsByPatient(patientId);
      res.json(treatments);
    } catch (error) {
      console.error('Error getting patient treatments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/treatments', async (req, res) => {
    try {
      const treatmentData = insertTreatmentSchema.parse(req.body);
      const treatment = await storage.createTreatment(treatmentData);
      res.status(201).json(treatment);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.put('/api/treatments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid treatment ID' });
      }
      
      const treatmentData = insertTreatmentSchema.partial().parse(req.body);
      const updatedTreatment = await storage.updateTreatment(id, treatmentData);
      
      if (!updatedTreatment) {
        return res.status(404).json({ message: 'Treatment not found' });
      }
      
      res.json(updatedTreatment);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  // DENTAL CHART ROUTES
  app.get('/api/patients/:id/dental-chart', async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      
      if (isNaN(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }
      
      const dentalChart = await storage.getDentalChart(patientId);
      res.json(dentalChart);
    } catch (error) {
      console.error('Error getting dental chart:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/dental-chart', async (req, res) => {
    try {
      const dentalChartData = insertDentalChartSchema.parse(req.body);
      const dentalChartEntry = await storage.createDentalChartEntry(dentalChartData);
      res.status(201).json(dentalChartEntry);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.put('/api/dental-chart/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid dental chart entry ID' });
      }
      
      const dentalChartData = insertDentalChartSchema.partial().parse(req.body);
      const updatedEntry = await storage.updateDentalChartEntry(id, dentalChartData);
      
      if (!updatedEntry) {
        return res.status(404).json({ message: 'Dental chart entry not found' });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // PAYMENT ROUTES
  app.get('/api/payments', async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error('Error getting payments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get('/api/patients/:id/payments', async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      
      if (isNaN(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }
      
      const payments = await storage.getPaymentsByPatient(patientId);
      res.json(payments);
    } catch (error) {
      console.error('Error getting patient payments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/payments', async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  app.put('/api/payments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid payment ID' });
      }
      
      const paymentData = insertPaymentSchema.partial().parse(req.body);
      const updatedPayment = await storage.updatePayment(id, paymentData);
      
      if (!updatedPayment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      res.json(updatedPayment);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  // DASHBOARD ROUTES
  app.get('/api/dashboard/stats', async (_req, res) => {
    try {
      const [patients, appointments, treatments] = await Promise.all([
        storage.getPatients(),
        storage.getAppointments(),
        storage.getTreatments()
      ]);

      const stats = {
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        totalTreatments: treatments.length,
        recentPatients: patients.slice(-5),
        upcomingAppointments: appointments
          .filter(a => new Date(a.date) > new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5)
      };

      res.json(stats);
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
