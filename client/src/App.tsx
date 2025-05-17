import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import PatientDetails from "@/pages/patient-details";
import Appointments from "@/pages/appointments";
import Treatments from "@/pages/treatments";
import Billing from "@/pages/billing";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/patients" component={Patients} />
        <Route path="/patients/:id" component={PatientDetails} />
        <Route path="/appointments" component={Appointments} />
        <Route path="/treatments" component={Treatments} />
        <Route path="/billing" component={Billing} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsAuthenticated(Boolean(user));
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <TooltipProvider>
          <Toaster />
          <Switch>
            <Route path="/login" component={LoginPage} />
            {isAuthenticated ? <Router /> : <Route component={LoginPage} />}
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
