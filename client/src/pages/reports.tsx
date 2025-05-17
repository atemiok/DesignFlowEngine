import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import ReportGenerator from "@/components/reports/ReportGenerator";
import { useQuery } from "@tanstack/react-query";
import { BarChart, LineChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Reports() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  
  const { data: treatments } = useQuery({
    queryKey: ['/api/treatments'],
  });
  
  const { data: appointments } = useQuery({
    queryKey: ['/api/appointments'],
  });
  
  const { data: patients } = useQuery({
    queryKey: ['/api/patients'],
  });
  
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });
  
  // Group treatments by type
  const treatmentsByType = treatments?.reduce((acc, treatment) => {
    const type = treatment.treatmentType;
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type] += 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  const treatmentTypeData = Object.entries(treatmentsByType).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);
  
  // Calculate revenue by month
  const revenueByMonth = treatments?.reduce((acc, treatment) => {
    const date = new Date(treatment.date);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const key = `${month} ${year}`;
    
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += Number(treatment.cost);
    return acc;
  }, {} as Record<string, number>) || {};
  
  const revenueData = Object.entries(revenueByMonth).map(([name, value]) => ({
    name,
    revenue: value,
  })).slice(-6); // Last 6 months
  
  // Appointment status data
  const appointmentsByStatus = appointments?.reduce((acc, appointment) => {
    const status = appointment.status;
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status] += 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  const appointmentStatusData = Object.entries(appointmentsByStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
    value,
  }));
  
  // Colors for charts
  const COLORS = ['#1976D2', '#42A5F5', '#4FC3F7', '#26C6DA', '#4CAF50', '#FF9800', '#F44336'];
  
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-500">Reports & Analysis</h2>
        <p className="text-neutral-400">Generate reports and view clinic performance analytics</p>
      </div>
      
      <div className="mb-6">
        <Tabs defaultValue="generate">
          <TabsList className="mb-4">
            <TabsTrigger value="generate">Generate Reports</TabsTrigger>
            <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate">
            <ReportGenerator />
          </TabsContent>
          
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-2">
                    <p className="text-sm text-neutral-500">Total Patients</p>
                    <p className="text-2xl font-bold">{patients?.length || 0}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-2">
                    <p className="text-sm text-neutral-500">Monthly Appointments</p>
                    <p className="text-2xl font-bold">{stats?.monthlyAppointments || 0}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-2">
                    <p className="text-sm text-neutral-500">Treatment Completion</p>
                    <p className="text-2xl font-bold">{stats?.treatmentCompletion || "0%"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={revenueData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip formatter={(value) => [`${formatCurrency(value)}`, 'Revenue']} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#1976D2" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Distribution</CardTitle>
                  <CardDescription>Breakdown by procedure type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={treatmentTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {treatmentTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} treatments`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
                <CardDescription>Breakdown of appointment statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={appointmentStatusData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Appointments" fill="#1976D2">
                        {appointmentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
