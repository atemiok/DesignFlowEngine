import { db } from "./db";
import { users, patients, medicalHistory, appointments, treatments, dentalChart, payments } from "@shared/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function initDb() {
  try {
    // Create tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'staff'
      );

      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        patient_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        id_number TEXT NOT NULL,
        gender TEXT NOT NULL,
        dob TEXT NOT NULL,
        email TEXT NOT NULL,
        insurance TEXT,
        service TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS medical_history (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES patients(id),
        allergies TEXT,
        conditions TEXT,
        medications TEXT,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES patients(id),
        doctor_id INTEGER NOT NULL REFERENCES users(id),
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        treatment TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS treatments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES patients(id),
        doctor_id INTEGER NOT NULL REFERENCES users(id),
        date TEXT NOT NULL,
        treatment_type TEXT NOT NULL,
        cost TEXT NOT NULL,
        notes TEXT,
        tooth TEXT
      );

      CREATE TABLE IF NOT EXISTS dental_chart (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES patients(id),
        tooth_number TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES patients(id),
        treatment_id INTEGER REFERENCES treatments(id),
        amount TEXT NOT NULL,
        date TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create initial doctor user
    const hashedPassword = await bcrypt.hash('password', 10);
    await db.insert(users).values({
      username: 'doctor',
      password: hashedPassword,
      name: 'Dr. Roberts',
      email: 'dr.roberts@dentalcare.com',
      phone: '+254712345678',
      role: 'doctor'
    });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

initDb(); 