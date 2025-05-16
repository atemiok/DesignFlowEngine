import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Plus } from "lucide-react";
import QuickStats from "@/components/dashboard/QuickStats";
import TodayAppointments from "@/components/dashboard/TodayAppointments";
import PatientLookup from "@/components/dashboard/PatientLookup";
import PatientDetails from "@/components/dashboard/PatientDetails";
import TreatmentHistory from "@/components/dashboard/TreatmentHistory";
import DentalChart from "@/components/dashboard/DentalChart";
import { Link } from "wouter";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>(undefined);
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentTreatments, setRecentTreatments] = useState([]);

  useEffect(() => {
    // Fetch recent patients, payments, and treatments
    // This is a placeholder for actual API calls
    setRecentPatients([
      { id: 1, name: "John Doe", phone: "+254123456789", service: "Checkup" },
      { id: 2, name: "Jane Smith", phone: "+254987654321", service: "Whitening" },
    ]);
    setRecentPayments([
      { id: 1, patientId: 1, amount: 1000, paymentMethod: "Mpesa", date: "01012023" },
      { id: 2, patientId: 2, amount: 2000, paymentMethod: "Cash", date: "02012023" },
    ]);
    setRecentTreatments([
      { id: 1, patientId: 1, service: "Checkup", date: "01012023" },
      { id: 2, patientId: 2, service: "Whitening", date: "02012023" },
    ]);
  }, []);

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-neutral-500 mb-4 md:mb-0">Dashboard</h2>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="text-neutral-500" size="sm">
            <FileDown className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Link href="/patients?new=true">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Patient
            </Button>
          </Link>
        </div>
      </div>

      <QuickStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodayAppointments />
        </div>
        
        <div>
          <PatientLookup />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div>
          <PatientDetails patientId={selectedPatientId} />
        </div>
        
        <div>
          <TreatmentHistory patientId={selectedPatientId} />
        </div>
        
        <div>
          <DentalChart patientId={selectedPatientId} />
        </div>
      </div>

      <div>
        <h2>Recent Patients</h2>
        <ul>
          {recentPatients.map((patient) => (
            <li key={patient.id}>
              {patient.name} - {patient.phone} - {patient.service}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Recent Payments</h2>
        <ul>
          {recentPayments.map((payment) => (
            <li key={payment.id}>
              Patient ID: {payment.patientId} - Amount: {payment.amount} - Method: {payment.paymentMethod} - Date: {payment.date}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Recent Treatments</h2>
        <ul>
          {recentTreatments.map((treatment) => (
            <li key={treatment.id}>
              Patient ID: {treatment.patientId} - Service: {treatment.service} - Date: {treatment.date}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
