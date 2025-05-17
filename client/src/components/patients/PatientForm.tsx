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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Combine patient and medical history schemas for the form
const patientFormSchema = z.object({
  name: insertPatientSchema.shape.name,
  idNumber: z.string().min(1, "ID number is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(8, "Date of birth is required").regex(/^\d{2}\d{2}\d{4}$/, "Date must be in ddmmyyyy format"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 characters")
    .regex(/^\+254[17]\d{8}$/, "Must be a valid Kenyan phone number (e.g., +254712345678)"),
  email: insertPatientSchema.shape.email.email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  insurance: insertPatientSchema.shape.insurance.optional(),
  service: z.string().min(1, "Service is required"),
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
                        <Input placeholder="Jane Wambui" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="35614782" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <Input placeholder="Male, Female, or Other" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" placeholder="DD/MM/YYYY" {...field} />
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
                          <Input placeholder="0712345678 or +254712345678" {...field} />
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
                        <Input placeholder="Estate, Street, City, County" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="insurance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="NHIF, AAR, Jubilee, etc." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="checkup">Checkup</SelectItem>
                            <SelectItem value="cleaning">Cleaning</SelectItem>
                            <SelectItem value="whitening">Whitening</SelectItem>
                            <SelectItem value="filling">Filling</SelectItem>
                            <SelectItem value="extraction">Extraction</SelectItem>
                            <SelectItem value="root-canal">Root Canal</SelectItem>
                            <SelectItem value="crown">Crown</SelectItem>
                            <SelectItem value="bridge">Bridge</SelectItem>
                            <SelectItem value="implant">Implant</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="medical" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Penicillin, Latex" {...field} value={field.value || ""} />
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
                        <Input placeholder="e.g., Hypertension, Diabetes" {...field} value={field.value || ""} />
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
                        <Input placeholder="e.g., Lisinopril, Metformin" {...field} value={field.value || ""} />
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
                          value={field.value || ""} 
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
