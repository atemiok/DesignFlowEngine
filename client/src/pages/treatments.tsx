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
import { Treatment, Patient } from "@shared/schema";
import { Plus, ChevronLeft, Edit } from "lucide-react";
import TreatmentForm from "@/components/treatments/TreatmentForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, formatCurrency, getInitials } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Treatments() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Parse URL query parameters
  const params = new URLSearchParams(location.split('?')[1]);
  const showNewForm = params.has('new') || params.has('patientId');
  const editId = params.get('id');
  const isEdit = editId && params.get('edit') === 'true';
  const patientId = params.get('patientId');
  
  const { data: treatments, isLoading: isLoadingTreatments } = useQuery<Treatment[]>({
    queryKey: ['/api/treatments'],
  });
  
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
  });
  
  const { data: treatmentToEdit } = useQuery({
    queryKey: [`/api/treatments/${editId}`],
    enabled: !!isEdit && !!editId,
  });
  
  // Filter treatments by search term
  const filteredTreatments = treatments?.filter(treatment => {
    if (!searchTerm) return true;
    
    const patient = patients?.find(p => p.id === treatment.patientId);
    const patientName = patient?.name || "";
    
    return (
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.treatmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (treatment.tooth && treatment.tooth.includes(searchTerm)) ||
      (treatment.notes && treatment.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  // Group treatments by type for the stats view
  const treatmentsByType = treatments?.reduce((acc, treatment) => {
    const type = treatment.treatmentType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(treatment);
    return acc;
  }, {} as Record<string, Treatment[]>) || {};
  
  // Calculate total revenue
  const totalRevenue = treatments?.reduce((sum, treatment) => sum + Number(treatment.cost), 0) || 0;
  
  const getPatientName = (patientId: number): string => {
    const patient = patients?.find((p) => p.id === patientId);
    return patient?.name || "Unknown Patient";
  };
  
  const handleCloseForm = () => {
    setLocation("/treatments");
  };
  
  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          {(showNewForm || isEdit) && (
            <Button variant="ghost" size="sm" onClick={handleCloseForm}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Treatments
            </Button>
          )}
          {!showNewForm && !isEdit && (
            <h2 className="text-xl font-semibold text-neutral-500">Treatments</h2>
          )}
        </div>
        
        {!showNewForm && !isEdit && (
          <Link href="/treatments?new=true">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Treatment
            </Button>
          </Link>
        )}
      </div>
      
      {showNewForm ? (
        <TreatmentForm 
          onSuccess={handleCloseForm} 
          defaultValues={patientId ? { patientId, doctorId: "1" } : undefined}
        />
      ) : isEdit && treatmentToEdit ? (
        <TreatmentForm 
          isEdit={true}
          treatmentId={parseInt(editId!)}
          onSuccess={handleCloseForm}
          defaultValues={{
            patientId: treatmentToEdit.patientId.toString(),
            doctorId: treatmentToEdit.doctorId.toString(),
            date: treatmentToEdit.date,
            treatmentType: treatmentToEdit.treatmentType,
            tooth: treatmentToEdit.tooth,
            notes: treatmentToEdit.notes,
            cost: treatmentToEdit.cost.toString(),
          }}
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-sm text-neutral-500">Total Treatments</p>
                  <p className="text-2xl font-bold">{treatments?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-sm text-neutral-500">This Month</p>
                  <p className="text-2xl font-bold">
                    {treatments?.filter(t => {
                      const treatmentDate = new Date(t.date);
                      const today = new Date();
                      return treatmentDate.getMonth() === today.getMonth() && 
                             treatmentDate.getFullYear() === today.getFullYear();
                    }).length || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-sm text-neutral-500">Most Common</p>
                  <p className="text-2xl font-bold">
                    {Object.entries(treatmentsByType).sort((a, b) => b[1].length - a[1].length)[0]?.[0] || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-sm text-neutral-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Treatment Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Search by patient, treatment type, or tooth number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
              
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Treatments</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="by-type">By Type</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {filteredTreatments?.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                      {searchTerm ? "No treatments found matching your search criteria" : "No treatment records available"}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTreatments?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((treatment) => (
                        <div key={treatment.id} className="p-4 border rounded-md bg-white hover:bg-neutral-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{getInitials(getPatientName(treatment.patientId))}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{getPatientName(treatment.patientId)}</p>
                                <p className="text-sm text-neutral-500">
                                  {formatDate(treatment.date)} - {treatment.treatmentType}
                                  {treatment.tooth && ` (Tooth #${treatment.tooth})`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <p className="font-medium text-primary">{formatCurrency(treatment.cost)}</p>
                              <Link href={`/treatments?id=${treatment.id}&edit=true`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </div>
                          {treatment.notes && (
                            <div className="mt-2 ml-13 text-sm text-neutral-500 bg-neutral-50 p-2 rounded-md">
                              Note: {treatment.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="recent">
                  {treatments?.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                      No treatment records available
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {treatments?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((treatment) => (
                          <div key={treatment.id} className="p-4 border rounded-md bg-white hover:bg-neutral-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>{getInitials(getPatientName(treatment.patientId))}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{getPatientName(treatment.patientId)}</p>
                                  <p className="text-sm text-neutral-500">
                                    {formatDate(treatment.date)} - {treatment.treatmentType}
                                    {treatment.tooth && ` (Tooth #${treatment.tooth})`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <p className="font-medium text-primary">{formatCurrency(treatment.cost)}</p>
                                <Link href={`/treatments?id=${treatment.id}&edit=true`}>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                </Link>
                              </div>
                            </div>
                            {treatment.notes && (
                              <div className="mt-2 ml-13 text-sm text-neutral-500 bg-neutral-50 p-2 rounded-md">
                                Note: {treatment.notes}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="by-type">
                  {Object.keys(treatmentsByType).length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                      No treatment records available
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(treatmentsByType)
                        .sort((a, b) => b[1].length - a[1].length)
                        .map(([type, treatments]) => (
                          <div key={type}>
                            <h3 className="text-lg font-medium mb-2 flex items-center justify-between">
                              <span>{type}</span>
                              <span className="text-sm text-neutral-500">{treatments.length} treatments</span>
                            </h3>
                            <div className="space-y-2">
                              {treatments
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 3)
                                .map((treatment) => (
                                  <div key={treatment.id} className="p-3 border rounded-md bg-white hover:bg-neutral-50 transition-colors">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-medium">{getPatientName(treatment.patientId)}</p>
                                        <p className="text-xs text-neutral-500">
                                          {formatDate(treatment.date)}
                                          {treatment.tooth && ` - Tooth #${treatment.tooth}`}
                                        </p>
                                      </div>
                                      <div className="text-primary font-medium">{formatCurrency(treatment.cost)}</div>
                                    </div>
                                  </div>
                                ))}
                              
                              {treatments.length > 3 && (
                                <Button variant="link" className="text-sm" size="sm">
                                  View all {treatments.length} {type} treatments
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
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
