import { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@shared/schema";
import { Plus, ChevronLeft } from "lucide-react";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import Calendar from "@/components/appointments/Calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

export default function Appointments() {
  const [location, setLocation] = useLocation();
  
  // Parse URL query parameters
  const params = new URLSearchParams(location.split('?')[1]);
  const showNewForm = params.has('new') || params.has('patientId');
  const editId = params.get('id');
  const isEdit = editId && params.get('edit') === 'true';
  const patientId = params.get('patientId');
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });
  
  const { data: patients } = useQuery({
    queryKey: ['/api/patients'],
  });
  
  const { data: appointmentToEdit } = useQuery({
    queryKey: [`/api/appointments/${editId}`],
    enabled: !!isEdit && !!editId,
  });
  
  // Filter appointments for different views
  const todayAppointments = appointments?.filter(a => a.date === today) || [];
  const upcomingAppointments = appointments?.filter(a => {
    return new Date(a.date) > new Date(today);
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];
  const pastAppointments = appointments?.filter(a => {
    return new Date(a.date) < new Date(today);
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
  
  const getPatientName = (patientId: number): string => {
    const patient = patients?.find((p) => p.id === patientId);
    return patient?.name || "Unknown Patient";
  };
  
  const getPatientInitials = (patientId: number): string => {
    const name = getPatientName(patientId);
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const handleCloseForm = () => {
    setLocation("/appointments");
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <Badge variant="outline" className="bg-success/10 text-success border-0">Checked In</Badge>;
      case 'waiting':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-0">Waiting</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-0">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-success/10 text-success border-0">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-0">Cancelled</Badge>;
      case 'no-show':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-0">No Show</Badge>;
      default:
        return <Badge variant="outline" className="bg-neutral-200 text-neutral-500 border-0">Scheduled</Badge>;
    }
  };
  
  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          {(showNewForm || isEdit) && (
            <Button variant="ghost" size="sm" onClick={handleCloseForm}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Appointments
            </Button>
          )}
          {!showNewForm && !isEdit && (
            <h2 className="text-xl font-semibold text-neutral-500">Appointments</h2>
          )}
        </div>
        
        {!showNewForm && !isEdit && (
          <div>
            <Button 
              size="sm" 
              onClick={() => setLocation("/appointments?new=true")}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Appointment
            </Button>
          </div>
        )}
      </div>
      
      {showNewForm ? (
        <AppointmentForm 
          onSuccess={handleCloseForm} 
          defaultValues={patientId ? { patientId, doctorId: "1" } : undefined}
        />
      ) : isEdit && appointmentToEdit ? (
        <AppointmentForm 
          isEdit={true}
          appointmentId={parseInt(editId!)}
          onSuccess={handleCloseForm}
          defaultValues={{
            patientId: appointmentToEdit.patientId.toString(),
            doctorId: appointmentToEdit.doctorId.toString(),
            date: appointmentToEdit.date,
            time: appointmentToEdit.time,
            treatment: appointmentToEdit.treatment,
            status: appointmentToEdit.status,
            notes: appointmentToEdit.notes,
          }}
        />
      ) : (
        <>
          <div className="mb-6">
            <Calendar />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Appointment List</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="today">
                <TabsList className="mb-4">
                  <TabsTrigger value="today">Today ({todayAppointments.length})</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                  <TabsTrigger value="past">Past Appointments</TabsTrigger>
                </TabsList>
                
                <TabsContent value="today">
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                      No appointments scheduled for today
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments
                        .sort((a, b) => {
                          // Convert 12-hour format to 24-hour for sorting
                          const timeA = a.time.replace(/(\d+):(\d+) (AM|PM)/, (_, h, m, ampm) => {
                            let hour = parseInt(h);
                            if (ampm === "PM" && hour < 12) hour += 12;
                            if (ampm === "AM" && hour === 12) hour = 0;
                            return `${hour.toString().padStart(2, "0")}:${m}`;
                          });
                          
                          const timeB = b.time.replace(/(\d+):(\d+) (AM|PM)/, (_, h, m, ampm) => {
                            let hour = parseInt(h);
                            if (ampm === "PM" && hour < 12) hour += 12;
                            if (ampm === "AM" && hour === 12) hour = 0;
                            return `${hour.toString().padStart(2, "0")}:${m}`;
                          });
                          
                          return timeA.localeCompare(timeB);
                        })
                        .map((appointment) => (
                          <div key={appointment.id} className="p-4 border rounded-md bg-white hover:bg-neutral-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>{getPatientInitials(appointment.patientId)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{getPatientName(appointment.patientId)}</p>
                                  <p className="text-sm text-neutral-500">{appointment.time} - {appointment.treatment}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(appointment.status)}
                                <Link href={`/appointments?id=${appointment.id}&edit=true`}>
                                  <Button variant="ghost" size="sm">Edit</Button>
                                </Link>
                              </div>
                            </div>
                            {appointment.notes && (
                              <div className="mt-2 ml-13 text-sm text-neutral-500 bg-neutral-50 p-2 rounded-md">
                                Note: {appointment.notes}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="upcoming">
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                      No upcoming appointments scheduled
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="p-4 border rounded-md bg-white hover:bg-neutral-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{getPatientInitials(appointment.patientId)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{getPatientName(appointment.patientId)}</p>
                                <p className="text-sm text-neutral-500">
                                  {formatDate(appointment.date)} at {appointment.time} - {appointment.treatment}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(appointment.status)}
                              <Link href={`/appointments?id=${appointment.id}&edit=true`}>
                                <Button variant="ghost" size="sm">Edit</Button>
                              </Link>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-2 ml-13 text-sm text-neutral-500 bg-neutral-50 p-2 rounded-md">
                              Note: {appointment.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past">
                  {pastAppointments.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                      No past appointments found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pastAppointments.slice(0, 10).map((appointment) => (
                        <div key={appointment.id} className="p-4 border rounded-md bg-white hover:bg-neutral-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{getPatientInitials(appointment.patientId)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{getPatientName(appointment.patientId)}</p>
                                <p className="text-sm text-neutral-500">
                                  {formatDate(appointment.date)} at {appointment.time} - {appointment.treatment}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(appointment.status)}
                              <Link href={`/appointments?id=${appointment.id}&edit=true`}>
                                <Button variant="ghost" size="sm">Edit</Button>
                              </Link>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-2 ml-13 text-sm text-neutral-500 bg-neutral-50 p-2 rounded-md">
                              Note: {appointment.notes}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {pastAppointments.length > 10 && (
                        <div className="text-center">
                          <Button variant="link">
                            View all {pastAppointments.length} past appointments
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
