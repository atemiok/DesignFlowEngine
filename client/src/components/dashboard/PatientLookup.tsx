import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, UserPlus, Calendar, Receipt, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Patient } from "@shared/schema";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientLookup() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: [searchQuery ? `/api/patients?q=${searchQuery}` : '/api/patients'],
  });
  
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });
  
  const recentPatients = patients?.slice(0, 3) || [];
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <h3 className="font-medium text-neutral-500 mb-4">Patient Lookup</h3>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
              type="text" 
              placeholder="Search patients..." 
              className="pl-10 border-neutral-200" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-xs text-neutral-400 uppercase font-medium mb-2">Recent Patients</h4>
          <div className="space-y-3">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between bg-neutral-100 p-2 rounded-md">
                  <div className="flex items-center">
                    <Skeleton className="w-8 h-8 rounded-full mr-2" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="w-6 h-6 rounded-full" />
                </div>
              ))
            ) : recentPatients.length === 0 ? (
              <div className="text-center text-sm text-neutral-400 py-2">
                No patients found
              </div>
            ) : (
              recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between bg-neutral-100 p-2 rounded-md">
                  <div className="flex items-center">
                    <Avatar className="w-8 h-8 bg-neutral-200 mr-2">
                      <AvatarFallback className="text-xs text-neutral-500">
                        {getInitials(patient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-neutral-500">{patient.name}</p>
                      <p className="text-xs text-neutral-400">#{patient.patientId}</p>
                    </div>
                  </div>
                  <Link href={`/patients/${patient.id}`}>
                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-500">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-xs text-neutral-400 uppercase font-medium mb-2">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/patients?new=true">
              <Button variant="outline" className="bg-primary-light/10 text-primary border-0 h-auto rounded-md p-3 w-full">
                <div className="flex flex-col items-center justify-center">
                  <UserPlus className="h-4 w-4 mb-1" />
                  <span className="text-sm font-medium">New Patient</span>
                </div>
              </Button>
            </Link>
            <Link href="/appointments?new=true">
              <Button variant="outline" className="bg-secondary-light/10 text-secondary border-0 h-auto rounded-md p-3 w-full">
                <div className="flex flex-col items-center justify-center">
                  <Calendar className="h-4 w-4 mb-1" />
                  <span className="text-sm font-medium">Schedule</span>
                </div>
              </Button>
            </Link>
            <Link href="/billing">
              <Button variant="outline" className="bg-accent/10 text-accent border-0 h-auto rounded-md p-3 w-full">
                <div className="flex flex-col items-center justify-center">
                  <Receipt className="h-4 w-4 mb-1" />
                  <span className="text-sm font-medium">Billing</span>
                </div>
              </Button>
            </Link>
            <Button variant="outline" className="bg-neutral-200 text-neutral-500 border-0 h-auto rounded-md p-3">
              <div className="flex flex-col items-center justify-center">
                <HelpCircle className="h-4 w-4 mb-1" />
                <span className="text-sm font-medium">Help</span>
              </div>
            </Button>
          </div>
        </div>
        
        <div>
          <h4 className="text-xs text-neutral-400 uppercase font-medium mb-2">Quick Stats</h4>
          <div className="space-y-2">
            <div className="bg-neutral-100 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-neutral-500">Total Patients</span>
                <span className="text-xs font-medium text-neutral-500">{stats?.totalPatients || 0}</span>
              </div>
              <Progress value={75} className="h-1 bg-neutral-200" />
            </div>
            <div className="bg-neutral-100 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-neutral-500">Monthly Appointments</span>
                <span className="text-xs font-medium text-neutral-500">{stats?.monthlyAppointments || 0}</span>
              </div>
              <Progress value={60} className="h-1 bg-neutral-200" />
            </div>
            <div className="bg-neutral-100 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-neutral-500">Treatment Completion</span>
                <span className="text-xs font-medium text-neutral-500">{stats?.treatmentCompletion || "0%"}</span>
              </div>
              <Progress value={92} className="h-1 bg-neutral-200" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
