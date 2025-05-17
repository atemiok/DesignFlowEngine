import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  Receipt,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const sidebarLinks = [
    { href: "/", icon: <LayoutDashboard className="h-4 w-4 mr-3" />, label: "Dashboard" },
    { href: "/patients", icon: <Users className="h-4 w-4 mr-3" />, label: "Patients" },
    { href: "/appointments", icon: <Calendar className="h-4 w-4 mr-3" />, label: "Appointments" },
    { href: "/treatments", icon: <Activity className="h-4 w-4 mr-3" />, label: "Treatments" },
    { href: "/billing", icon: <Receipt className="h-4 w-4 mr-3" />, label: "Billing" },
    { href: "/reports", icon: <BarChart2 className="h-4 w-4 mr-3" />, label: "Reports" },
    { href: "/settings", icon: <Settings className="h-4 w-4 mr-3" />, label: "Settings" },
  ];
  
  const handleLogout = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: `Goodbye, ${user.name || "User"}!`,
    });
    navigate("/login");
  };
  
  return (
    <aside 
      className={cn(
        "w-64 bg-white h-full shadow-sm flex-shrink-0 fixed lg:relative z-20 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <nav className="py-4 h-full flex flex-col">
        <div className="px-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 bg-neutral-100 text-neutral-500 border-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium cursor-pointer",
                      location === link.href
                        ? "text-primary bg-primary-light/10 border-l-3 border-primary"
                        : "text-neutral-500 hover:bg-neutral-100"
                    )}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-4 py-2">
          <div className="bg-neutral-100 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-500">Storage</span>
              <span className="text-xs text-neutral-400">75% used</span>
            </div>
            <Progress value={75} className="h-1.5 bg-neutral-200" />
            <div className="mt-2">
              <Button variant="link" size="sm" className="text-xs text-primary font-medium p-0">
                Manage
              </Button>
            </div>
          </div>
        </div>
        <div className="px-4 py-2 border-t border-neutral-200">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-neutral-500 px-3" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span className="text-sm font-medium">Logout</span>
          </Button>
        </div>
      </nav>
    </aside>
  );
}
