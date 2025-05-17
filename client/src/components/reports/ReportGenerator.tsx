import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Patient, Appointment, Treatment, Payment } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { Download, Printer } from "lucide-react";

const reportFormSchema = z.object({
  reportType: z.string().min(1, "Report type is required"),
  patientId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export default function ReportGenerator() {
  const [reportData, setReportData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });
  
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: "",
      patientId: "",
      dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
    },
  });
  
  const watchReportType = form.watch("reportType");
  
  // Update selected report type when form value changes
  if (watchReportType !== selectedReportType) {
    setSelectedReportType(watchReportType);
    setReportData(null);
  }
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `DentalCare_${selectedReportType}_Report`,
    onBeforeGetContent: () => {
      toast({
        title: "Preparing report for printing...",
      });
      return Promise.resolve();
    },
    onAfterPrint: () => {
      toast({
        title: "Print successful",
        description: "Report has been sent to your printer.",
      });
    },
  });
  
  // Generate CSV content for download
  const generateCSV = () => {
    if (!reportData) return;
    
    let csvContent = "";
    
    // Add headers
    if (selectedReportType === "appointments") {
      csvContent = "Date,Time,Patient,Treatment,Status,Doctor\n";
      
      // Add rows
      (reportData as Appointment[]).forEach(appointment => {
        const patient = patients?.find(p => p.id === appointment.patientId);
        csvContent += `"${appointment.date}","${appointment.time}","${patient?.name || 'Unknown'}","${appointment.treatment}","${appointment.status}","Dr. Roberts"\n`;
      });
    } else if (selectedReportType === "treatments") {
      csvContent = "Date,Patient,Treatment,Tooth,Cost,Doctor\n";
      
      // Add rows
      (reportData as Treatment[]).forEach(treatment => {
        const patient = patients?.find(p => p.id === treatment.patientId);
        csvContent += `"${treatment.date}","${patient?.name || 'Unknown'}","${treatment.treatmentType}","${treatment.tooth || 'N/A'}","${treatment.cost}","Dr. Roberts"\n`;
      });
    } else if (selectedReportType === "payments") {
      csvContent = "Date,Patient,Amount,Method,Status,Notes\n";
      
      // Add rows
      (reportData as Payment[]).forEach(payment => {
        const patient = patients?.find(p => p.id === payment.patientId);
        csvContent += `"${payment.date}","${patient?.name || 'Unknown'}","${payment.amount}","${payment.method}","${payment.status}","${payment.notes || 'N/A'}"\n`;
      });
    } else if (selectedReportType === "patients") {
      csvContent = "Patient ID,Name,Phone,Email,Address,Insurance\n";
      
      // Add rows
      (reportData as Patient[]).forEach(patient => {
        csvContent += `"${patient.patientId}","${patient.name}","${patient.phone}","${patient.email}","${patient.address}","${patient.insurance || 'N/A'}"\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DentalCare_${selectedReportType}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const onSubmit = async (data: ReportFormValues) => {
    setIsGenerating(true);
    
    try {
      let apiUrl = "";
      let queryParams = new URLSearchParams();
      
      // Add date filters if provided
      if (data.dateFrom) {
        queryParams.append("from", data.dateFrom);
      }
      
      if (data.dateTo) {
        queryParams.append("to", data.dateTo);
      }
      
      // Build the API URL based on report type
      switch (data.reportType) {
        case "appointments":
          apiUrl = "/api/appointments";
          break;
        case "treatments":
          apiUrl = "/api/treatments";
          break;
        case "payments":
          apiUrl = "/api/payments";
          break;
        case "patients":
          apiUrl = "/api/patients";
          break;
        default:
          throw new Error("Invalid report type");
      }
      
      // Add patient filter if provided and not patient report
      if (data.patientId && data.reportType !== "patients") {
        apiUrl = `/api/patients/${data.patientId}/${data.reportType}`;
      }
      
      // Add query params if any
      if (queryParams.toString()) {
        apiUrl += `?${queryParams.toString()}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch report data: ${response.statusText}`);
      }
      
      const result = await response.json();
      setReportData(result);
      
      toast({
        title: "Report Generated",
        description: `${result.length} records found`,
      });
    } catch (error) {
      toast({
        title: "Failed to generate report",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      console.error("Report generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const renderReportTable = () => {
    if (!reportData) return null;
    
    switch (selectedReportType) {
      case "appointments":
        return (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Treatment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {reportData.map((appointment: Appointment) => {
                const patient = patients?.find(p => p.id === appointment.patientId);
                return (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(appointment.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{appointment.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{patient?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{appointment.treatment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      <span className={`px-2 py-1 text-xs rounded-full 
                        ${appointment.status === 'checked-in' ? 'bg-success/10 text-success' : 
                          appointment.status === 'waiting' ? 'bg-warning/10 text-warning' : 
                            'bg-neutral-100 text-neutral-500'}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace(/-/g, ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
        
      case "treatments":
        return (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Treatment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tooth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {reportData.map((treatment: Treatment) => {
                const patient = patients?.find(p => p.id === treatment.patientId);
                return (
                  <tr key={treatment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(treatment.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{patient?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{treatment.treatmentType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{treatment.tooth || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatCurrency(treatment.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
        
      case "payments":
        return (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {reportData.map((payment: Payment) => {
                const patient = patients?.find(p => p.id === payment.patientId);
                return (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatDate(payment.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{patient?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      <span className={`px-2 py-1 text-xs rounded-full 
                        ${payment.status === 'completed' ? 'bg-success/10 text-success' : 
                          payment.status === 'pending' ? 'bg-warning/10 text-warning' : 
                            'bg-neutral-100 text-neutral-500'}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
        
      case "patients":
        return (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Patient ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Insurance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {reportData.map((patient: Patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{patient.patientId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{patient.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{patient.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{patient.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{patient.insurance || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
        
      default:
        return <div className="text-center py-8 text-neutral-400">Select a report type and generate a report</div>;
    }
  };
  
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Report Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="appointments">Appointments Report</SelectItem>
                        <SelectItem value="treatments">Treatments Report</SelectItem>
                        <SelectItem value="payments">Payments Report</SelectItem>
                        <SelectItem value="patients">Patients Report</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedReportType && selectedReportType !== "patients" && (
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All Patients" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">All Patients</SelectItem>
                          {isLoadingPatients ? (
                            <SelectItem value="" disabled>Loading patients...</SelectItem>
                          ) : (
                            patients?.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id.toString()}>
                                {patient.name} - #{patient.patientId}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Report Results</CardTitle>
          {reportData && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={generateCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div ref={printRef} className="overflow-x-auto">
            {isGenerating ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : reportData ? (
              reportData.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">No data found for the selected criteria</div>
              ) : (
                <>
                  {/* Print-only header */}
                  <div className="hidden print:block mb-4">
                    <h1 className="text-xl font-bold mb-2">DentalCare - {selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} Report</h1>
                    <p className="text-sm text-neutral-500">
                      Generated on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {renderReportTable()}
                  
                  {/* Summary for print */}
                  <div className="hidden print:block mt-4 pt-4 border-t">
                    <p className="text-sm text-neutral-500">Total records: {reportData.length}</p>
                  </div>
                </>
              )
            ) : (
              <div className="text-center py-8 text-neutral-400">
                Configure report parameters and click "Generate Report"
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
