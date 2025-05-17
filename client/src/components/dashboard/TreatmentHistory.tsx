import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, MoreVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Treatment } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";

interface TreatmentHistoryProps {
  patientId?: number;
}

export default function TreatmentHistory({ patientId }: TreatmentHistoryProps) {
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['/api/patients'],
  });
  
  // Use the first patient if patientId is not provided
  const selectedPatientId = patientId || (patients?.[0]?.id || 0);
  
  const { data: treatments, isLoading: isLoadingTreatments } = useQuery<Treatment[]>({
    queryKey: [`/api/patients/${selectedPatientId}/treatments`],
    enabled: !!selectedPatientId,
  });
  
  const isLoading = isLoadingPatients || isLoadingTreatments;
  
  const getBorderColor = (index: number) => {
    const colors = ['primary', 'secondary', 'neutral-300'];
    return colors[index % colors.length];
  };
  
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-neutral-500">Treatment History</h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <RefreshCcw className="h-4 w-4 text-neutral-400" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4 text-neutral-400" />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-l-2 border-neutral-300 pl-3 relative">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-1/2 mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : !treatments?.length ? (
          <div className="text-center py-4 text-neutral-400 mb-4">
            No treatment history available
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {treatments.slice(0, 4).map((treatment, index) => (
              <div key={treatment.id} className={`border-l-2 border-${getBorderColor(index)} pl-3 relative`}>
                <div className={`absolute w-2 h-2 bg-${getBorderColor(index)} rounded-full left-[-4.5px] top-1.5`}></div>
                <div className="flex justify-between mb-1">
                  <h4 className="text-sm font-medium text-neutral-500">{treatment.treatmentType}</h4>
                  <span className="text-xs text-neutral-400">{formatDate(treatment.date)}</span>
                </div>
                <p className="text-xs text-neutral-400 mb-1">Dr. Roberts</p>
                <p className="text-xs text-neutral-500">{treatment.notes || 'No notes available'}</p>
              </div>
            ))}
          </div>
        )}
        
        <h4 className="text-sm font-medium text-neutral-500 mb-2">Treatment Plan</h4>
        <div className="bg-neutral-100 p-3 rounded-md mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-neutral-500">Root Canal</span>
            <span className="text-xs text-neutral-400">Scheduled: Apr 10, 2023</span>
          </div>
          <p className="text-xs text-neutral-500 mb-2">Treatment for tooth #14 with Dr. Chen.</p>
          <div className="flex justify-between">
            <span className="text-xs font-medium text-primary">Est. Cost: $850</span>
            <span className="text-xs text-neutral-400">Insurance: 80% coverage</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          {patientId ? (
            <Link href={`/patients/${patientId}`}>
              <Button variant="link" className="text-sm text-primary font-medium">
                View Complete History
                <span className="material-icons text-sm ml-1">arrow_forward</span>
              </Button>
            </Link>
          ) : (
            <Button variant="link" className="text-sm text-primary font-medium">
              View Complete History
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
