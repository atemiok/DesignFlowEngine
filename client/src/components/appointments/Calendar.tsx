import { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Appointment, Patient } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Link } from "wouter";

export default function Calendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [calendarAppointments, setCalendarAppointments] = useState<Record<string, number>>({});
  
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  // Format dates for API
  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];
  
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments?start=${startDate}&end=${endDate}`],
  });
  
  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });
  
  // Calculate the selected date in ISO format
  const selectedDateISO = date.toISOString().split('T')[0];
  
  // Filter appointments for the selected date
  const selectedDateAppointments = appointments?.filter(
    (appointment) => appointment.date === selectedDateISO
  ) || [];
  
  // Build a map of date -> appointment count
  useEffect(() => {
    if (!appointments) return;
    
    const appointmentCounts: Record<string, number> = {};
    
    appointments.forEach((appointment) => {
      if (!appointmentCounts[appointment.date]) {
        appointmentCounts[appointment.date] = 0;
      }
      appointmentCounts[appointment.date]++;
    });
    
    setCalendarAppointments(appointmentCounts);
  }, [appointments]);
  
  // Get patient name by ID
  const getPatientName = (patientId: number): string => {
    const patient = patients?.find((p) => p.id === patientId);
    return patient?.name || "Unknown Patient";
  };
  
  // Render appointment count badges on calendar days
  const renderDayContent = (day: Date) => {
    const dateKey = day.toISOString().split('T')[0];
    const count = calendarAppointments[dateKey];
    
    if (!count) return null;
    
    return (
      <div className="absolute bottom-0 right-0 left-0 flex justify-center">
        <Badge variant="outline" className="text-[8px] h-3 min-w-3 bg-primary text-white px-1">
          {count}
        </Badge>
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-600">Appointment Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="rounded-md border"
            components={{
              DayContent: (props) => (
                <div className="relative h-9 w-9 p-0 flex items-center justify-center">
                  <span>{props.date.getDate()}</span>
                  {renderDayContent(props.date)}
                </div>
              ),
            }}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-600">
            Appointments for {formatDate(selectedDateISO)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAppointments || isLoadingPatients ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : selectedDateAppointments.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              No appointments scheduled for this date
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateAppointments
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
                  <div
                    key={appointment.id}
                    className="p-3 border rounded-md bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-neutral-700">{appointment.time}</span>
                      <Badge
                        variant="outline"
                        className={`
                          ${appointment.status === "checked-in" 
                            ? "bg-success/10 text-success" 
                            : appointment.status === "waiting" 
                              ? "bg-warning/10 text-warning"
                              : "bg-neutral-200 text-neutral-500"} 
                          border-0
                        `}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace(/-/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{getPatientName(appointment.patientId)}</div>
                        <div className="text-sm text-neutral-500">{appointment.treatment}</div>
                      </div>
                      <Link href={`/patients/${appointment.patientId}`}>
                        <div className="text-sm text-primary hover:underline cursor-pointer">View</div>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
