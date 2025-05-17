import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize, MoreVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DentalChart as DentalChartType } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useState } from "react";

interface DentalChartProps {
  patientId?: number;
}

export default function DentalChart({ patientId }: DentalChartProps) {
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['/api/patients'],
  });
  
  // Use the first patient if patientId is not provided
  const selectedPatientId = patientId || (patients?.[0]?.id || 0);
  
  const { data: dentalChartData, isLoading: isLoadingDentalChart } = useQuery<DentalChartType[]>({
    queryKey: [`/api/patients/${selectedPatientId}/dental-chart`],
    enabled: !!selectedPatientId,
  });
  
  const isLoading = isLoadingPatients || isLoadingDentalChart;
  
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => 32 - i);
  
  const getToothStatus = (toothNumber: number) => {
    if (!dentalChartData) return '';
    
    const tooth = dentalChartData.find(t => t.toothNumber === toothNumber.toString());
    return tooth ? tooth.status : '';
  };
  
  const getToothClassName = (toothNumber: number) => {
    const status = getToothStatus(toothNumber);
    switch (status) {
      case 'needs-treatment':
        return 'bg-error/10';
      case 'treatment-scheduled':
        return 'bg-primary/10';
      case 'treated':
        return 'bg-secondary/10';
      case 'healthy':
        return 'bg-success/10';
      default:
        return '';
    }
  };
  
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-neutral-500">Dental Chart</h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Maximize className="h-4 w-4 text-neutral-400" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4 text-neutral-400" />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="mb-4">
            <Skeleton className="h-32 w-full mb-2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>Upper Right</span>
              <span>Upper Left</span>
            </div>
            <div className="grid grid-cols-16 gap-[2px] mb-2">
              {upperTeeth.map(tooth => (
                <button 
                  key={tooth} 
                  className={`aspect-square flex items-center justify-center border border-neutral-300 rounded-sm text-[10px] ${getToothClassName(tooth)}`}
                >
                  {tooth}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-16 gap-[2px]">
              {lowerTeeth.map(tooth => (
                <button 
                  key={tooth} 
                  className={`aspect-square flex items-center justify-center border border-neutral-300 rounded-sm text-[10px] ${getToothClassName(tooth)}`}
                >
                  {tooth}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>Lower Right</span>
              <span>Lower Left</span>
            </div>
          </div>
        )}
        
        <h4 className="text-sm font-medium text-neutral-500 mb-2">Legend</h4>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-error/10 mr-2 border border-neutral-200 rounded-sm"></div>
            <span className="text-xs text-neutral-500">Needs Treatment</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-primary/10 mr-2 border border-neutral-200 rounded-sm"></div>
            <span className="text-xs text-neutral-500">Treatment Scheduled</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-secondary/10 mr-2 border border-neutral-200 rounded-sm"></div>
            <span className="text-xs text-neutral-500">Treated</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-success/10 mr-2 border border-neutral-200 rounded-sm"></div>
            <span className="text-xs text-neutral-500">Healthy</span>
          </div>
        </div>
        
        <h4 className="text-sm font-medium text-neutral-500 mb-2">Notes</h4>
        {isLoading ? (
          <div className="space-y-2 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !dentalChartData?.length ? (
          <div className="text-center py-2 text-neutral-400 mb-4">
            No dental chart notes available
          </div>
        ) : (
          <div className="mb-4">
            {dentalChartData.filter(t => t.notes).slice(0, 3).map((tooth) => (
              <div key={tooth.id} className="bg-neutral-100 p-2 rounded-md text-xs text-neutral-500 mb-2">
                <p><span className="font-medium">Tooth #{tooth.toothNumber}:</span> {tooth.notes}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-center">
          {patientId ? (
            <Link href={`/patients/${patientId}`}>
              <Button variant="link" className="text-sm text-primary font-medium">
                Full Dental Chart
                <span className="material-icons text-sm ml-1">arrow_forward</span>
              </Button>
            </Link>
          ) : (
            <Button variant="link" className="text-sm text-primary font-medium">
              Full Dental Chart
              <span className="material-icons text-sm ml-1">arrow_forward</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
