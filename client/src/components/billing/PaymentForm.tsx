import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPaymentSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Treatment } from "@shared/schema";

// Replace the string amount with a number for the form
const paymentFormSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  treatmentId: z.string().optional(),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    { message: "Amount must be a valid positive number" }
  ),
  date: z.string().min(8, "Date is required").regex(/^\d{2}\d{2}\d{4}$/, "Date must be in ddmmyyyy format"),
  paymentMethod: z.enum(["mpesa", "cash", "insurance"], { message: "Payment method must be mpesa, cash, or insurance" }),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<PaymentFormValues>;
  isEdit?: boolean;
  paymentId?: number;
}

export default function PaymentForm({
  onSuccess,
  defaultValues = {},
  isEdit = false,
  paymentId,
}: PaymentFormProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  

  
  const { data: patients } = useQuery({
    queryKey: ['/api/patients'],
  });
  
  // Prepare default values - convert numbers to strings for the form
  const preparedDefaultValues = {
    ...defaultValues,
    amount: defaultValues.amount ? String(defaultValues.amount) : "",
    patientId: defaultValues.patientId ? String(defaultValues.patientId) : "",
    treatmentId: defaultValues.treatmentId ? String(defaultValues.treatmentId) : "",
  };
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: preparedDefaultValues || {
      patientId: "",
      treatmentId: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      method: "mpesa", // Default to M-Pesa as common in Kenya
      status: "completed",
      notes: "",
    },
  });
  
  // Watch patientId to load treatments for that patient
  const watchPatientId = form.watch("patientId");
  
  const { data: treatments } = useQuery<Treatment[]>({
    queryKey: [`/api/patients/${watchPatientId}/treatments`],
    enabled: !!watchPatientId,
  });
  
  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      const paymentData = {
        ...data,
        patientId: parseInt(data.patientId),
        treatmentId: data.treatmentId ? parseInt(data.treatmentId) : null,
        amount: parseFloat(data.amount),
      };
      
      const response = await apiRequest("POST", "/api/payments", paymentData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Payment record created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${data.patientId}/payments`] });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/billing");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment record",
        variant: "destructive",
      });
    },
  });
  
  const updatePaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      if (!paymentId) throw new Error("Payment ID is required for updates");
      
      const paymentData = {
        ...data,
        patientId: parseInt(data.patientId),
        treatmentId: data.treatmentId ? parseInt(data.treatmentId) : null,
        amount: parseFloat(data.amount),
      };
      
      const response = await apiRequest("PUT", `/api/payments/${paymentId}`, paymentData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Payment record updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${data.patientId}/payments`] });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/billing");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment record",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: PaymentFormValues) => {
    if (isEdit) {
      updatePaymentMutation.mutate(data);
    } else {
      createPaymentMutation.mutate(data);
    }
  };
  
  const paymentMethods = [
    "mpesa",
    "cash",
    "insurance",
    "bank transfer",
    "credit card",
    "nhif",
    "corporate"
  ];
  
  const statusOptions = [
    "pending",
    "completed",
    "failed",
    "refunded",
    "partially-paid",
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Payment" : "New Payment"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients?.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name} - #{patient.patientId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="treatmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Treatment (Optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Treatment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None (General Payment)</SelectItem>
                      {treatments?.map((treatment) => (
                        <SelectItem key={treatment.id} value={treatment.id.toString()}>
                          {treatment.treatmentType} - {treatment.date} (KES {treatment.cost})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (KES)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mpesa">Mpesa</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional payment information" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/billing")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createPaymentMutation.isPending || updatePaymentMutation.isPending}
              >
                {isEdit ? "Update Payment" : "Record Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
