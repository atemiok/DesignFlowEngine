import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Patient, MedicalHistory, Appointment, Treatment, DentalChart as DentalChartType, Payment } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Phone, Mail, MapPin, Shield, Edit, Calendar as CalendarIcon, Activity, Receipt, ChevronLeft } from "lucide-react";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import PatientForm from "@/components/patients/PatientForm";
import TreatmentHistory from "@/components/dashboard/TreatmentHistory";
import DentalChart from "@/components/dashboard/DentalChart";

export default function PatientDetails() {
  const { id } = useParams();
  const patientId = parseInt(id);
  const [isEditing, setIsEditing] = useState(false);
  
  // Queries for patient data
  const { data: patient, isLoading: isLoadingPatient } = useQuery<Patient>({
    queryKey: [`/api/patients/${patientId}`],
    enabled: !isNaN(patientId),
  });
  
  const { data: medicalHistory, isLoading: isLoadingMedicalHistory } = useQuery<MedicalHistory>({
    queryKey: [`/api/patients/${patientId}/medical-history`],
    enabled: !isNaN(patientId),
  });
  
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: [`/api/patients/${patientId}/appointments`],
    enabled: !isNaN(patientId),
  });
  
  const { data: treatments, isLoading: isLoadingTreatments } = useQuery<Treatment[]>({
    queryKey: [`/api/patients/${patientId}/treatments`],
    enabled: !isNaN(patientId),
  });
  
  const { data: payments, isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: [`/api/patients/${patientId}/payments`],
    enabled: !isNaN(patientId),
  });
  
  const isLoading = isLoadingPatient || isLoadingMedicalHistory || isLoadingAppointments || isLoadingTreatments || isLoadingPayments;
  
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
  
  const getTotalPayments = () => {
    if (!payments) return 0;
    return payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  };
  
  const getTotalTreatmentCosts = () => {
    if (!treatments) return 0;
    return treatments.reduce((sum, treatment) => sum + Number(treatment.cost), 0);
  };
  
  const getOutstandingBalance = () => {
    return getTotalTreatmentCosts() - getTotalPayments();
  };
  
  if (isEditing) {
    return (
      <div>
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Patient
          </Button>
        </div>
        
        <PatientForm 
          isEdit={true}
          patientId={patientId}
          defaultValues={patient && {
            name: patient.name,
            dob: patient.dob,
            phone: patient.phone,
            email: patient.email,
            address: patient.address,
            insurance: patient.insurance,
            ...(medicalHistory && {
              allergies: medicalHistory.allergies,
              conditions: medicalHistory.conditions,
              medications: medicalHistory.medications,
              notes: medicalHistory.notes,
            })
          }}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }
  
  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <Link href="/patients">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Patients
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Link href={`/appointments?patientId=${patientId}`}>
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Schedule Appointment
            </Button>
          </Link>
          <Link href={`/treatments?patientId=${patientId}`}>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-1" />
              New Treatment
            </Button>
          </Link>
          <Link href={`/billing?patientId=${patientId}`}>
            <Button variant="outline" size="sm">
              <Receipt className="h-4 w-4 mr-1" />
              Add Payment
            </Button>
          </Link>
          <Button size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-4">
                  <Skeleton className="h-20 w-20 rounded-full mb-4" />
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : !patient ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">Patient not found</h3>
              <p className="text-neutral-500">The patient you're looking for doesn't exist or has been removed.</p>
              <div className="mt-4">
                <Link href="/patients">
                  <Button>Back to Patients</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="w-24 h-24 text-2xl mb-4">
                    <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold text-neutral-700">{patient.name}</h2>
                  <p className="text-sm text-neutral-500">#{patient.patientId}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-neutral-500">{patient.dob}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-neutral-500">{patient.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-neutral-500">{patient.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-neutral-500">{patient.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="text-sm font-medium">Insurance</p>
                      <p className="text-sm text-neutral-500">{patient.insurance || "No insurance"}</p>
                    </div>
                  </div>
                </div>
                
                {/* Balance Summary */}
                <div className="mt-6 p-4 bg-neutral-50 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Balance Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Charges:</span>
                      <span className="font-medium">{formatCurrency(getTotalTreatmentCosts())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payments Made:</span>
                      <span className="font-medium">{formatCurrency(getTotalPayments())}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-neutral-200">
                      <span>Outstanding Balance:</span>
                      <span className={`font-medium ${getOutstandingBalance() > 0 ? 'text-error' : 'text-success'}`}>
                        {formatCurrency(getOutstandingBalance())}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="treatments">Treatments</TabsTrigger>
                <TabsTrigger value="dental-chart">Dental Chart</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                {/* Medical History */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Medical History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!medicalHistory ? (
                      <div className="text-center py-4 text-neutral-400">
                        No medical history available
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                            <h3 className="text-sm font-medium">Allergies</h3>
                            <p className="text-sm text-neutral-500">{medicalHistory.allergies || "None recorded"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Medical Conditions</h3>
                            <p className="text-sm text-neutral-500">{medicalHistory.conditions || "None recorded"}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h3 className="text-sm font-medium">Current Medications</h3>
                            <p className="text-sm text-neutral-500">{medicalHistory.medications || "None recorded"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">Additional Notes</h3>
                            <p className="text-sm text-neutral-500">{medicalHistory.notes || "No additional notes"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Recent Appointments */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Recent Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!appointments || appointments.length === 0 ? (
                      <div className="text-center py-4 text-neutral-400">
                        No appointments scheduled
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.slice(0, 3).map((appointment) => (
                          <div key={appointment.id} className="p-3 border rounded-md bg-neutral-50">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-primary" />
                                <span className="font-medium">{formatDate(appointment.date)} {appointment.time}</span>
                              </div>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <div className="ml-6">
                              <p className="text-sm">{appointment.treatment}</p>
                              {appointment.notes && <p className="text-xs text-neutral-500 mt-1">{appointment.notes}</p>}
                            </div>
                          </div>
                        ))}
                        
                        {appointments.length > 3 && (
                          <div className="text-center">
                            <Link href={`/appointments?patientId=${patientId}`}>
                              <Button variant="link" size="sm">
                                View all {appointments.length} appointments
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Recent Treatments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Treatments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!treatments || treatments.length === 0 ? (
                      <div className="text-center py-4 text-neutral-400">
                        No treatment records available
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {treatments.slice(0, 3).map((treatment) => (
                          <div key={treatment.id} className="p-3 border rounded-md bg-neutral-50">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-secondary" />
                                <span className="font-medium">{treatment.treatmentType}</span>
                              </div>
                              <span className="text-sm text-neutral-500">{formatDate(treatment.date)}</span>
                            </div>
                            <div className="ml-6">
                              {treatment.tooth && <p className="text-sm">Tooth: #{treatment.tooth}</p>}
                              <p className="text-sm text-primary font-medium">{formatCurrency(treatment.cost)}</p>
                              {treatment.notes && <p className="text-xs text-neutral-500 mt-1">{treatment.notes}</p>}
                            </div>
                          </div>
                        ))}
                        
                        {treatments.length > 3 && (
                          <div className="text-center">
                            <Link href={`/treatments?patientId=${patientId}`}>
                              <Button variant="link" size="sm">
                                View all {treatments.length} treatments
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="appointments">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointments</CardTitle>
                    <CardDescription>All scheduled and past appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!appointments || appointments.length === 0 ? (
                      <div className="text-center py-4 text-neutral-400">
                        No appointments found for this patient
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <div key={appointment.id} className="p-4 border rounded-md bg-white hover:bg-neutral-50 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4 text-primary" />
                                  <span className="font-medium">{formatDate(appointment.date)} at {appointment.time}</span>
                                </div>
                              </div>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <div className="pl-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{appointment.treatment}</p>
                                  <p className="text-sm text-neutral-500">Dr. Roberts</p>
                                </div>
                                <div className="flex space-x-2">
                                  <Link href={`/appointments?id=${appointment.id}&edit=true`}>
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                              {appointment.notes && (
                                <div className="mt-2 text-sm text-neutral-500 bg-neutral-50 p-2 rounded-md">
                                  {appointment.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-center">
                      <Link href={`/appointments?patientId=${patientId}`}>
                        <Button>
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Schedule New Appointment
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="treatments">
                <Card>
                  <CardHeader>
                    <CardTitle>Treatment History</CardTitle>
                    <CardDescription>All treatment procedures and records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!treatments || treatments.length === 0 ? (
                      <div className="text-center py-4 text-neutral-400">
                        No treatment records found for this patient
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {treatments.map((treatment) => (
                          <div key={treatment.id} className="p-4 border rounded-md bg-white hover:bg-neutral-50 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-secondary" />
                                <span className="font-medium">{treatment.treatmentType}</span>
                              </div>
                              <span className="text-sm text-neutral-500">{formatDate(treatment.date)}</span>
                            </div>
                            <div className="pl-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  {treatment.tooth && <p className="text-sm">Tooth: #{treatment.tooth}</p>}
                                  <p className="text-sm">Provider: Dr. Roberts</p>
                                  <p className="text-sm text-primary font-medium mt-1">{formatCurrency(treatment.cost)}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <Link href={`/treatments?id=${treatment.id}&edit=true`}>
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                              {treatment.notes && (
                                <div className="mt-2 text-sm text-neutral-500 bg-neutral-50 p-2 rounded-md">
                                  {treatment.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-center">
                      <Link href={`/treatments?patientId=${patientId}`}>
                        <Button>
                          <Activity className="h-4 w-4 mr-1" />
                          Add New Treatment
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="dental-chart">
                <DentalChart patientId={patientId} />
              </TabsContent>
              
              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>Payment history and outstanding balance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 p-4 bg-neutral-50 rounded-md">
                      <h3 className="text-lg font-medium mb-2">Balance Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-white rounded-md shadow-sm">
                          <p className="text-sm text-neutral-500">Total Charges</p>
                          <p className="text-xl font-semibold">{formatCurrency(getTotalTreatmentCosts())}</p>
                        </div>
                        <div className="p-3 bg-white rounded-md shadow-sm">
                          <p className="text-sm text-neutral-500">Payments Made</p>
                          <p className="text-xl font-semibold">{formatCurrency(getTotalPayments())}</p>
                        </div>
                        <div className="p-3 bg-white rounded-md shadow-sm">
                          <p className="text-sm text-neutral-500">Outstanding Balance</p>
                          <p className={`text-xl font-semibold ${getOutstandingBalance() > 0 ? 'text-error' : 'text-success'}`}>
                            {formatCurrency(getOutstandingBalance())}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-4">Payment History</h3>
                    {!payments || payments.length === 0 ? (
                      <div className="text-center py-4 text-neutral-400">
                        No payment records found for this patient
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <div key={payment.id} className="p-4 border rounded-md bg-white hover:bg-neutral-50 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-primary" />
                                <span className="font-medium">{formatDate(payment.date)}</span>
                              </div>
                              <Badge variant="outline" className={`
                                ${payment.status === 'completed' ? 'bg-success/10 text-success' : 
                                  payment.status === 'pending' ? 'bg-warning/10 text-warning' : 
                                    'bg-neutral-100 text-neutral-500'} 
                                border-0
                              `}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="pl-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-lg font-medium text-primary">{formatCurrency(payment.amount)}</p>
                                  <p className="text-sm text-neutral-500">
                                    Method: {payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1)}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <Link href={`/billing?id=${payment.id}&edit=true`}>
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                              {payment.notes && (
                                <div className="mt-2 text-sm text-neutral-500 bg-neutral-50 p-2 rounded-md">
                                  {payment.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-center">
                      <Link href={`/billing?patientId=${patientId}`}>
                        <Button>
                          <Receipt className="h-4 w-4 mr-1" />
                          Record New Payment
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
}
