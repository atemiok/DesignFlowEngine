import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Plus } from "lucide-react";
import QuickStats from "@/components/dashboard/QuickStats";
import TodayAppointments from "@/components/dashboard/TodayAppointments";
import PatientLookup from "@/components/dashboard/PatientLookup";
import PatientDetails from "@/components/dashboard/PatientDetails";
import TreatmentHistory from "@/components/dashboard/TreatmentHistory";
import DentalChart from "@/components/dashboard/DentalChart";
import { Link } from "wouter";

export default function Dashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>(undefined);
  
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
    </>
  );
}
