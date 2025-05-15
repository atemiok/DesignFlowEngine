import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  MoreVertical, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Shield, 
  File
} from "lucide-react";
import { Patient, MedicalHistory } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientDetailsProps {
  patientId?: number;
}

export default function PatientDetails({ patientId }: PatientDetailsProps) {
  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });
  
  // Use the first patient if patientId is not provided
  const selectedPatientId = patientId || (patients?.[0]?.id || 0);
  
  const { data: medicalHistory, isLoading: isLoadingMedicalHistory } = useQuery<MedicalHistory>({
    queryKey: [`/api/patients/${selectedPatientId}/medical-history`],
    enabled: !!selectedPatientId,
  });
  
  const selectedPatient = patients?.find(patient => patient.id === selectedPatientId);
  
  const isLoading = isLoadingPatients || isLoadingMedicalHistory;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-neutral-500">Patient Details</h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4 text-neutral-400" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4 text-neutral-400" />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center mb-4">
            <Skeleton className="w-16 h-16 rounded-full mb-2" />
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : !selectedPatient ? (
          <div className="text-center py-4 text-neutral-400">
            No patient selected
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-4">
              <Avatar className="w-16 h-16 bg-neutral-200 mb-2">
                <AvatarFallback className="text-xl text-neutral-500">
                  {getInitials(selectedPatient.name)}
                </AvatarFallback>
              </Avatar>
              <h4 className="text-lg font-medium text-neutral-500">{selectedPatient.name}</h4>
              <p className="text-sm text-neutral-400">#{selectedPatient.patientId}</p>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm">
                <Calendar className="text-neutral-400 mr-2 h-4 w-4" />
                <span className="text-neutral-400">DOB:</span>
                <span className="ml-auto text-neutral-500 font-medium">{selectedPatient.dob}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="text-neutral-400 mr-2 h-4 w-4" />
                <span className="text-neutral-400">Phone:</span>
                <span className="ml-auto text-neutral-500 font-medium">{selectedPatient.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="text-neutral-400 mr-2 h-4 w-4" />
                <span className="text-neutral-400">Email:</span>
                <span className="ml-auto text-neutral-500 font-medium">{selectedPatient.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="text-neutral-400 mr-2 h-4 w-4" />
                <span className="text-neutral-400">Address:</span>
                <span className="ml-auto text-neutral-500 font-medium">{selectedPatient.address}</span>
              </div>
              <div className="flex items-center text-sm">
                <Shield className="text-neutral-400 mr-2 h-4 w-4" />
                <span className="text-neutral-400">Insurance:</span>
                <span className="ml-auto text-neutral-500 font-medium">{selectedPatient.insurance || 'None'}</span>
              </div>
            </div>
            
            <div className="border-t border-neutral-200 pt-3 mb-4">
              <h4 className="text-sm font-medium text-neutral-500 mb-2">Medical History</h4>
              {isLoadingMedicalHistory ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : !medicalHistory ? (
                <div className="text-sm text-neutral-400 text-center py-2">
                  No medical history available
                </div>
              ) : (
                <div className="space-y-2">
                  {medicalHistory.allergies && (
                    <div className="bg-neutral-100 p-2 rounded-md text-sm text-neutral-500">
                      <span className="font-medium">Allergies:</span> {medicalHistory.allergies}
                    </div>
                  )}
                  {medicalHistory.conditions && (
                    <div className="bg-neutral-100 p-2 rounded-md text-sm text-neutral-500">
                      <span className="font-medium">Conditions:</span> {medicalHistory.conditions}
                    </div>
                  )}
                  {medicalHistory.medications && (
                    <div className="bg-neutral-100 p-2 rounded-md text-sm text-neutral-500">
                      <span className="font-medium">Medications:</span> {medicalHistory.medications}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" className="bg-neutral-100 text-neutral-500 border-0">
                Medical History
              </Button>
              <Link href={`/patients/${selectedPatient.id}`}>
                <Button className="bg-primary text-white">Full Profile</Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
