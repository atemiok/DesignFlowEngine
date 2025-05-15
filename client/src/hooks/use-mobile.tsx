import { useState, useEffect } from "react";

export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if window is available (for SSR)
    if (typeof window === "undefined") return;
    
    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Run once
    checkMobile();
    
    // Set up listener
    window.addEventListener("resize", checkMobile);
    
    // Clean up
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  return isMobile;
}
