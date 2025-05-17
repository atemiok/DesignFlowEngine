import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  ActivitySquare, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";

interface Stat {
  title: string;
  value: string | number;
  trend: 'up' | 'down';
  trendValue: string;
  icon: React.ReactNode;
  color: string;
}

export default function QuickStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start">
                <Skeleton className="w-10 h-10 rounded-md mr-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-24 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const stats: Stat[] = [
    {
      title: "Today's Appointments",
      value: data?.todayAppointments || 0,
      trend: 'up',
      trendValue: '8% from yesterday',
      icon: <Calendar className="h-5 w-5 text-primary" />,
      color: 'primary-light/10',
    },
    {
      title: "New Patients",
      value: data?.newPatients || 0,
      trend: 'down',
      trendValue: '5% from last week',
      icon: <Users className="h-5 w-5 text-secondary" />,
      color: 'secondary-light/10',
    },
    {
      title: "Pending Payments",
      value: `$${data?.pendingPayments || 0}`,
      trend: 'up',
      trendValue: '12% from last month',
      icon: <DollarSign className="h-5 w-5 text-accent" />,
      color: 'accent/10',
    },
    {
      title: "Treatments Completed",
      value: data?.treatmentsCompleted || 0,
      trend: 'up',
      trendValue: '3% from last week',
      icon: <ActivitySquare className="h-5 w-5 text-warning" />,
      color: 'warning/10',
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className={`bg-${stat.color} p-3 rounded-md mr-4`}>
                {stat.icon}
              </div>
              <div>
                <h3 className="text-sm text-neutral-400 font-medium">{stat.title}</h3>
                <p className="text-xl font-semibold text-neutral-500">{stat.value}</p>
              </div>
            </div>
            <div className={`mt-3 text-xs ${stat.trend === 'up' ? 'text-success' : 'text-error'} flex items-center`}>
              {stat.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              <span>{stat.trendValue}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
