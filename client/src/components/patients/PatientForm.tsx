import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPatientSchema, insertMedicalHistorySchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Combine patient and medical history schemas for the form
const patientFormSchema = z.object({
  name: insertPatientSchema.shape.name,
  dob: insertPatientSchema.shape.dob,
  phone: insertPatientSchema.shape.phone,
  email: insertPatientSchema.shape.email.email("Invalid email address"),
  address: insertPatientSchema.shape.address,
  insurance: insertPatientSchema.shape.insurance.optional(),
  allergies: insertMedicalHistorySchema.shape.allergies.optional(),
  conditions: insertMedicalHistorySchema.shape.conditions.optional(),
  medications: insertMedicalHistorySchema.shape.medications.optional(),
  notes: insertMedicalHistorySchema.shape.notes.optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<PatientFormValues>;
  isEdit?: boolean;
  patientId?: number;
}

export default function PatientForm({ 
  onSuccess, 
  defaultValues = {}, 
  isEdit = false,
  patientId
}: PatientFormProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      dob: "",
      phone: "",
      email: "",
      address: "",
      insurance: "",
      allergies: "",
      conditions: "",
      medications: "",
      notes: "",
      ...defaultValues,
    },
  });
  
  const createPatientMutation = useMutation({
    mutationFn: async (data: PatientFormValues) => {
      // Extract patient and medical history data
      const { allergies, conditions, medications, notes, ...patientData } = data;
      
      // Create patient first
      const response = await apiRequest("POST", "/api/patients", patientData);
      const patient = await response.json();
      
      // Create medical history if any of those fields are filled
      if (allergies || conditions || medications || notes) {
        await apiRequest("POST", "/api/medical-history", {
          patientId: patient.id,
          allergies,
          conditions,
          medications,
          notes,
        });
      }
      
      return patient;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/patients/${data.id}`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create patient",
        variant: "destructive",
      });
    },
  });
  
  const updatePatientMutation = useMutation({
    mutationFn: async (data: PatientFormValues) => {
      if (!patientId) throw new Error("Patient ID is required for updates");
      
      // Extract patient and medical history data
      const { allergies, conditions, medications, notes, ...patientData } = data;
      
      // Update patient
      const response = await apiRequest("PUT", `/api/patients/${patientId}`, patientData);
      const patient = await response.json();
      
      // Get existing medical history
      const medHistoryRes = await fetch(`/api/patients/${patientId}/medical-history`);
      
      if (medHistoryRes.ok) {
        // Update existing medical history
        const medHistory = await medHistoryRes.json();
        await apiRequest("PUT", `/api/medical-history/${medHistory.id}`, {
          allergies,
          conditions,
          medications,
          notes,
        });
      } else if (allergies || conditions || medications || notes) {
        // Create new medical history if it doesn't exist
        await apiRequest("POST", "/api/medical-history", {
          patientId,
          allergies,
          conditions,
          medications,
          notes,
        });
      }
      
      return patient;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Patient updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/medical-history`] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update patient",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: PatientFormValues) => {
    if (isEdit) {
      updatePatientMutation.mutate(data);
    } else {
      createPatientMutation.mutate(data);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Patient" : "New Patient"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                <TabsTrigger value="medical">Medical History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/DD/YYYY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Anytown, ST 12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="insurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Insurance Provider" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="medical" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Penicillin, Latex" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Conditions</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Hypertension, Diabetes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Medications</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Lisinopril, Metformin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any other important medical information" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/patients")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createPatientMutation.isPending || updatePatientMutation.isPending}
              >
                {isEdit ? "Update Patient" : "Create Patient"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
