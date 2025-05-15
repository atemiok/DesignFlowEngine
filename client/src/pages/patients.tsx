import { useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Patient } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Calendar, Activity, Receipt, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PatientForm from "@/components/patients/PatientForm";

export default function Patients() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const showNewPatientForm = location.includes("?new=true");
  
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: [searchQuery ? `/api/patients?q=${searchQuery}` : '/api/patients'],
  });
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCloseForm = () => {
    setLocation("/patients");
  };
  
  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-neutral-500 mb-4 md:mb-0">Patients</h2>
        {!showNewPatientForm && (
          <Link href="/patients?new=true">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Patient
            </Button>
          </Link>
        )}
      </div>
      
      {showNewPatientForm ? (
        <PatientForm onSuccess={handleCloseForm} />
      ) : (
        <>
          <div className="mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    className="pl-10"
                    placeholder="Search patients by name, ID, phone, or email"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Patient List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Patient</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Insurance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients && patients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-neutral-400">
                            No patients found. {searchQuery && "Try a different search term."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        patients?.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{patient.name}</div>
                                  <div className="text-sm text-neutral-500">#{patient.patientId} • {patient.dob}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{patient.phone}</div>
                                <div className="text-neutral-500">{patient.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {patient.insurance || "No insurance"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Link href={`/patients/${patient.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <Link href={`/patients/${patient.id}`}>
                                      <DropdownMenuItem>
                                        <MoreHorizontal className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                    </Link>
                                    <Link href={`/appointments?patientId=${patient.id}`}>
                                      <DropdownMenuItem>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Schedule Appointment
                                      </DropdownMenuItem>
                                    </Link>
                                    <Link href={`/treatments?patientId=${patient.id}`}>
                                      <DropdownMenuItem>
                                        <Activity className="h-4 w-4 mr-2" />
                                        Add Treatment
                                      </DropdownMenuItem>
                                    </Link>
                                    <Link href={`/billing?patientId=${patient.id}`}>
                                      <DropdownMenuItem>
                                        <Receipt className="h-4 w-4 mr-2" />
                                        Billing
                                      </DropdownMenuItem>
                                    </Link>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
