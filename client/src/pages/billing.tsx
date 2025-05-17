import { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Payment, Patient, Treatment } from "@shared/schema";
import { Plus, ChevronLeft, Edit, Download, FileText } from "lucide-react";
import PaymentForm from "@/components/billing/PaymentForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, formatCurrency, getInitials } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function Billing() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Parse URL query parameters
  const params = new URLSearchParams(location.split('?')[1]);
  const showNewForm = params.has('new') || params.has('patientId');
  const editId = params.get('id');
  const isEdit = editId && params.get('edit') === 'true';
  const patientId = params.get('patientId');
  
  const { data: payments, isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
  });
  
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });
  
  const { data: treatments } = useQuery<Treatment[]>({
    queryKey: ['/api/treatments'],
  });
  
  const { data: paymentToEdit } = useQuery({
    queryKey: [`/api/payments/${editId}`],
    enabled: !!isEdit && !!editId,
  });
  
  // Filter payments by search term
  const filteredPayments = payments?.filter(payment => {
    if (!searchTerm) return true;
    
    const patient = patients?.find(p => p.id === payment.patientId);
    const patientName = patient?.name || "";
    
    return (
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.notes && payment.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  // Calculate totals
  const totalPayments = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
  const totalTreatmentCosts = treatments?.reduce((sum, treatment) => sum + Number(treatment.cost), 0) || 0;
  const outstandingBalance = totalTreatmentCosts - totalPayments;
  const paymentPercentage = totalTreatmentCosts > 0 ? (totalPayments / totalTreatmentCosts) * 100 : 0;
  
  // Group by payment method
  const paymentsByMethod = payments?.reduce((acc, payment) => {
    const method = payment.paymentMethod;
    if (!acc[method]) {
      acc[method] = 0;
    }
    acc[method] += Number(payment.amount);
    return acc;
  }, {} as Record<string, number>) || {};
  
  const getPatientName = (patientId: number): string => {
    const patient = patients?.find((p) => p.id === patientId);
    return patient?.name || "Unknown Patient";
  };
  
  const getTreatmentName = (treatmentId: number | null): string => {
    if (!treatmentId) return "General Payment";
    const treatment = treatments?.find((t) => t.id === treatmentId);
    return treatment ? treatment.treatmentType : "Unknown Treatment";
  };
  
  const handleCloseForm = () => {
    setLocation("/billing");
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-success/10 text-success border-0">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-0">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-0">Failed</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-secondary/10 text-secondary border-0">Refunded</Badge>;
      case 'partially-paid':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-0">Partially Paid</Badge>;
      default:
        return <Badge variant="outline" className="bg-neutral-200 text-neutral-500 border-0">{status}</Badge>;
    }
  };
  
  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          {(showNewForm || isEdit) && (
            <Button variant="ghost" size="sm" onClick={handleCloseForm}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Billing
            </Button>
          )}
          {!showNewForm && !isEdit && (
            <h2 className="text-xl font-semibold text-neutral-500">Billing</h2>
          )}
        </div>
        
        {!showNewForm && !isEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              Invoices
            </Button>
            <Link href="/billing?new=true">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Payment
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {showNewForm ? (
        <PaymentForm 
          onSuccess={handleCloseForm} 
          defaultValues={patientId ? { patientId } : undefined}
        />
      ) : isEdit && paymentToEdit ? (
        <PaymentForm 
          isEdit={true}
          paymentId={parseInt(editId!)}
          onSuccess={handleCloseForm}
          defaultValues={{
            patientId: paymentToEdit.patientId.toString(),
            treatmentId: paymentToEdit.treatmentId ? paymentToEdit.treatmentId.toString() : undefined,
            amount: paymentToEdit.amount.toString(),
            date: paymentToEdit.date,
            paymentMethod: paymentToEdit.paymentMethod,
            status: paymentToEdit.status,
            notes: paymentToEdit.notes,
          }}
        />
      ) : (
        <>
          <div className="mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm text-neutral-500 mb-1">Total Charges</h3>
                    <p className="text-2xl font-bold">{formatCurrency(totalTreatmentCosts)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm text-neutral-500 mb-1">Payments Received</h3>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalPayments)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm text-neutral-500 mb-1">Outstanding Balance</h3>
                    <p className={`text-2xl font-bold ${outstandingBalance > 0 ? 'text-destructive' : 'text-success'}`}>
                      {formatCurrency(outstandingBalance)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Payment Progress</span>
                    <span>{paymentPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={paymentPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Records</CardTitle>
                  <CardDescription>View and manage all payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label htmlFor="search" className="sr-only">
                      Search
                    </Label>
                    <Input
                      id="search"
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-neutral-400">
                              {searchTerm ? "No payments found matching your search criteria" : "No payment records available"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPayments?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>{formatDate(payment.date)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="text-xs">{getInitials(getPatientName(payment.patientId))}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm font-medium">{getPatientName(payment.patientId)}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                                <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                <TableCell className="text-right">
                                  <Link href={`/billing?id=${payment.id}&edit=true`}>
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Breakdown by payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(paymentsByMethod).length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                      No payment data available
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(paymentsByMethod)
                        .sort((a, b) => b[1] - a[1])
                        .map(([method, amount]) => (
                          <div key={method} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium capitalize">{method}</span>
                              <span className="text-sm text-primary font-medium">{formatCurrency(amount)}</span>
                            </div>
                            <Progress 
                              value={(amount / totalPayments) * 100} 
                              className="h-2" 
                            />
                            <p className="text-xs text-neutral-500">
                              {((amount / totalPayments) * 100).toFixed(1)}% of total payments
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                  
                  <div className="mt-6 pt-4 border-t">
                    <h3 className="font-medium mb-2">Recent Transactions</h3>
                    <div className="space-y-2">
                      {payments?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map((payment) => (
                          <div key={payment.id} className="flex justify-between items-center text-sm p-2 hover:bg-neutral-50 rounded-md">
                            <div>
                              <p>{getPatientName(payment.patientId)}</p>
                              <p className="text-xs text-neutral-500">{formatDate(payment.date)}</p>
                            </div>
                            <p className="font-medium text-primary">{formatCurrency(payment.amount)}</p>
                          </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export Payment History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>Outstanding balances by patient</CardDescription>
            </CardHeader>
            <CardContent>
              {patients?.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  No patients with outstanding balances
                </div>
              ) : (
                <div className="space-y-4">
                  {patients?.map((patient) => {
                    const patientTreatments = treatments?.filter(t => t.patientId === patient.id) || [];
                    const patientPayments = payments?.filter(p => p.patientId === patient.id) || [];
                    
                    const totalTreatmentCost = patientTreatments.reduce((sum, t) => sum + Number(t.cost), 0);
                    const totalPaid = patientPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                    const balance = totalTreatmentCost - totalPaid;
                    
                    // Only show patients with outstanding balance
                    if (balance <= 0) return null;
                    
                    return (
                      <div key={patient.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-neutral-500">#{patient.patientId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-destructive font-medium">{formatCurrency(balance)}</p>
                            <p className="text-xs text-neutral-500">Outstanding</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1 mt-3">
                          <div className="flex justify-between text-sm">
                            <span>Payment Progress</span>
                            <span>{totalTreatmentCost > 0 ? ((totalPaid / totalTreatmentCost) * 100).toFixed(1) : 0}%</span>
                          </div>
                          <Progress 
                            value={totalTreatmentCost > 0 ? (totalPaid / totalTreatmentCost) * 100 : 0} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div className="mt-3 flex justify-end">
                          <Link href={`/billing?patientId=${patient.id}`}>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Record Payment
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
