import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [location] = useLocation();
  
  // Extract title from location
  const getTitle = () => {
    const path = location === "/" ? "dashboard" : location.substring(1);
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
  };
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="lg:hidden"
          >
            <span className="material-icons text-neutral-500">menu</span>
          </Button>
          <h1 className="text-xl font-semibold text-primary ml-2">DentalCare</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-neutral-100"
            >
              <Bell className="h-5 w-5 text-neutral-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8 bg-primary">
              <AvatarFallback className="text-white text-sm font-medium">DR</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-neutral-500 hidden md:inline-block">Dr. Roberts</span>
          </div>
        </div>
      </div>
    </header>
  );
}
