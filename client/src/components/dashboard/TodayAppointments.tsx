import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RefreshCcw, MoreVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Appointment, Patient } from "@shared/schema";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface AppointmentWithPatient extends Appointment {
  patient?: Patient;
}

export default function TodayAppointments() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments?date=${today}`],
  });
  
  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });
  
  const [appointmentsWithPatients, setAppointmentsWithPatients] = useState<AppointmentWithPatient[]>([]);
  
  useEffect(() => {
    if (appointments && patients) {
      const enrichedAppointments = appointments.map(appointment => {
        const patient = patients.find(p => p.id === appointment.patientId);
        return { ...appointment, patient };
      });
      
      setAppointmentsWithPatients(enrichedAppointments);
    }
  }, [appointments, patients]);
  
  const isLoading = isLoadingAppointments || isLoadingPatients;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <Badge variant="outline" className="bg-success/10 text-success border-0">Checked In</Badge>;
      case 'waiting':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-0">Waiting</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-0">Completed</Badge>;
      default:
        return <Badge variant="outline" className="bg-neutral-200 text-neutral-500 border-0">Scheduled</Badge>;
    }
  };
  
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
          <h3 className="font-medium text-neutral-500">Today's Appointments</h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <RefreshCcw className="h-4 w-4 text-neutral-400" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4 text-neutral-400" />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 pb-3 border-b border-neutral-200">
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-7 h-7 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-neutral-400 border-b border-neutral-200">
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 font-medium">Patient</th>
                  <th className="pb-2 font-medium">Treatment</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsWithPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-sm text-neutral-400">
                      No appointments scheduled for today
                    </td>
                  </tr>
                ) : (
                  appointmentsWithPatients.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-neutral-200">
                      <td className="py-3 text-sm text-neutral-500">{appointment.time}</td>
                      <td className="py-3">
                        <div className="flex items-center">
                          <Avatar className="w-7 h-7 bg-neutral-200 mr-2">
                            <AvatarFallback className="text-xs text-neutral-500">
                              {appointment.patient ? getInitials(appointment.patient.name) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-neutral-500">
                              {appointment.patient?.name || 'Unknown Patient'}
                            </p>
                            <p className="text-xs text-neutral-400">
                              #{appointment.patient?.patientId || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-neutral-500">{appointment.treatment}</td>
                      <td className="py-3">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="py-3">
                        <Link href={`/patients/${appointment.patientId}`}>
                          <Button variant="link" className="text-primary hover:text-primary-dark text-sm font-medium h-auto p-0">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 flex justify-center">
          <Link href="/appointments">
            <Button variant="link" className="text-sm text-primary font-medium">
              View All Appointments
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
