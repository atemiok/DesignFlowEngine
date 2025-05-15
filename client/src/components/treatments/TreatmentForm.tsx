import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertTreatmentSchema } from "@shared/schema";
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

// Replace the string cost with a number for the form
const treatmentFormSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  treatmentType: z.string().min(1, "Treatment type is required"),
  tooth: z.string().optional(),
  notes: z.string().optional(),
  cost: z.string().min(1, "Cost is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    { message: "Cost must be a valid positive number" }
  ),
});

type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;

interface TreatmentFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<TreatmentFormValues>;
  isEdit?: boolean;
  treatmentId?: number;
}

export default function TreatmentForm({
  onSuccess,
  defaultValues = {},
  isEdit = false,
  treatmentId,
}: TreatmentFormProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: patients } = useQuery({
    queryKey: ['/api/patients'],
  });
  
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Prepare default cost value - convert number to string for the form
  const preparedDefaultValues = {
    ...defaultValues,
    cost: defaultValues.cost ? String(defaultValues.cost) : "",
    patientId: defaultValues.patientId ? String(defaultValues.patientId) : "",
    doctorId: defaultValues.doctorId ? String(defaultValues.doctorId) : "",
  };
  
  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      date: new Date().toISOString().split('T')[0],
      treatmentType: "",
      tooth: "",
      notes: "",
      cost: "",
      ...preparedDefaultValues,
    },
  });
  
  const createTreatmentMutation = useMutation({
    mutationFn: async (data: TreatmentFormValues) => {
      const treatmentData = {
        ...data,
        patientId: parseInt(data.patientId),
        doctorId: parseInt(data.doctorId),
        cost: parseFloat(data.cost),
      };
      
      const response = await apiRequest("POST", "/api/treatments", treatmentData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Treatment record created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/treatments'] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${data.patientId}/treatments`] });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/treatments");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create treatment record",
        variant: "destructive",
      });
    },
  });
  
  const updateTreatmentMutation = useMutation({
    mutationFn: async (data: TreatmentFormValues) => {
      if (!treatmentId) throw new Error("Treatment ID is required for updates");
      
      const treatmentData = {
        ...data,
        patientId: parseInt(data.patientId),
        doctorId: parseInt(data.doctorId),
        cost: parseFloat(data.cost),
      };
      
      const response = await apiRequest("PUT", `/api/treatments/${treatmentId}`, treatmentData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Treatment record updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/treatments'] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${data.patientId}/treatments`] });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/treatments");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update treatment record",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: TreatmentFormValues) => {
    if (isEdit) {
      updateTreatmentMutation.mutate(data);
    } else {
      createTreatmentMutation.mutate(data);
    }
  };
  
  const treatmentOptions = [
    "Dental Cleaning",
    "Teeth Whitening",
    "Fluoride Treatment",
    "Sealant",
    "Filling",
    "Root Canal",
    "Crown",
    "Bridge",
    "Denture",
    "Implant",
    "Extraction",
    "Periodontal Treatment",
    "Orthodontic Treatment",
    "TMJ Treatment",
    "Oral Surgery",
    "Cosmetic Procedure",
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Treatment Record" : "New Treatment Record"}</CardTitle>
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
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Fallback to default doctor if API doesn't return users */}
                      {users?.filter(u => u.role === 'doctor').map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name}
                        </SelectItem>
                      )) || <SelectItem value="1">Dr. Roberts</SelectItem>}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="treatmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatment Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Treatment Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {treatmentOptions.map((treatment) => (
                          <SelectItem key={treatment} value={treatment}>
                            {treatment}
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
                name="tooth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tooth Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 14, 18" {...field} />
                    </FormControl>
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
                      placeholder="Treatment details, observations, etc." 
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
                onClick={() => navigate("/treatments")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createTreatmentMutation.isPending || updateTreatmentMutation.isPending}
              >
                {isEdit ? "Update Treatment" : "Save Treatment"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
