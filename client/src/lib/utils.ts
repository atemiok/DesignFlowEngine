import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date from ISO string to readable format
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  // Check if date is already in a readable format (e.g., "Mar 15, 2023")
  if (dateString.includes(',')) return dateString;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // If it's not a valid ISO date, return the original string
    return dateString;
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format currency in KES (Kenyan Shillings)
export function formatCurrency(amount: number | string): string {
  if (typeof amount === 'string') {
    amount = parseFloat(amount);
  }
  
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Generate initials from name
export function getInitials(name: string): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

// Status badge color mapping
export const statusColors = {
  'scheduled': 'bg-neutral-200 text-neutral-500',
  'confirmed': 'bg-primary-light/10 text-primary',
  'checked-in': 'bg-success/10 text-success',
  'waiting': 'bg-warning/10 text-warning',
  'in-progress': 'bg-primary/10 text-primary',
  'completed': 'bg-success/10 text-success',
  'cancelled': 'bg-destructive/10 text-destructive',
  'no-show': 'bg-destructive/10 text-destructive',
  'pending': 'bg-warning/10 text-warning',
  'paid': 'bg-success/10 text-success',
  'partially-paid': 'bg-warning/10 text-warning',
};

// Initialize data for some common queries that will be used throughout the app
export async function initializeData() {
  try {
    // Get dashboard stats
    await fetch('/api/dashboard/stats');
    
    // Get patients
    await fetch('/api/patients');
    
    // Get today's appointments
    const today = new Date().toISOString().split('T')[0];
    await fetch(`/api/appointments?date=${today}`);
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
}
