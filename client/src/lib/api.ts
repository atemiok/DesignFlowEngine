const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin
  : '';

interface ApiError extends Error {
  status?: number;
  data?: any;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = new Error(response.statusText);
    error.status = response.status;
    try {
      error.data = await response.json();
    } catch {
      error.data = await response.text();
    }
    throw error;
  }
  return response.json();
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  return handleResponse<T>(response);
}

// API endpoints
export const api = {
  // Auth
  login: (username: string, password: string) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (userData: any) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Dashboard
  getDashboardStats: () =>
    apiRequest('/api/dashboard/stats'),

  // Patients
  getPatients: (query?: string) =>
    apiRequest(`/api/patients${query ? `?q=${query}` : ''}`),

  getPatient: (id: number) =>
    apiRequest(`/api/patients/${id}`),

  // Appointments
  getAppointments: (date?: string) =>
    apiRequest(`/api/appointments${date ? `?date=${date}` : ''}`),

  // Treatments
  getTreatments: () =>
    apiRequest('/api/treatments'),
}; 