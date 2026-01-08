import {
  AuthResponse,
  GoogleAuthRequest,
  User,
  Dog,
  DogCreate,
  DogUpdate,
  Vet,
  VetCreate,
  VetUpdate,
  Medicine,
  MedicineCreate,
  MedicineUpdate,
  Event,
  EventCreate,
  EventUpdate,
  VetVisit,
  VetVisitCreate,
  VetVisitUpdate,
  MedicineEvent,
  MedicineEventCreate,
  MedicineEventUpdate,
  CustomEvent,
  CustomEventCreate,
  CustomEventUpdate,
  UploadResponse
} from '../types';
import { getAuthHeader } from '../utils/auth';

/**
 * Smart API URL detection following PriPals/Airspace patterns
 */
const getApiUrl = (): string => {
  // 1. Use VITE_API_URL if set (production or explicit override)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. In production build, use empty string (same origin via Nginx proxy)
  if (import.meta.env.PROD) {
    return '';
  }

  const hostname = window.location.hostname;

  // 3. Tailscale: http://hostname:8000
  if (hostname.includes('ts.net')) {
    return `http://${hostname}:8005`;
  }

  // 4. Local IP: http://192.168.x.x:8000
  if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return `http://${hostname}:8005`;
  }

  // 5. Default: http://localhost:8000
  return 'http://localhost:8005';
};

const API_URL = getApiUrl();

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.detail || 'An error occurred');
    }

    // Handle 204 No Content responses (common for DELETE operations)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

/**
 * API client with all backend endpoints
 */
export const apiClient = {
  // Authentication endpoints
  auth: {
    /**
     * Authenticate with Google OAuth token
     */
    googleAuth: (token: string): Promise<AuthResponse> => {
      const request: GoogleAuthRequest = { token };
      return apiFetch<AuthResponse>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },

    /**
     * Get current user info
     */
    getMe: (): Promise<User> => {
      return apiFetch<User>('/api/auth/me', {
        headers: getAuthHeader(),
      });
    },
  },

  // Dog endpoints
  dogs: {
    getAll: (): Promise<Dog[]> => {
      return apiFetch<Dog[]>('/api/dogs', {
        headers: getAuthHeader(),
      });
    },

    getById: (id: string): Promise<Dog> => {
      return apiFetch<Dog>(`/api/dogs/${id}`, {
        headers: getAuthHeader(),
      });
    },

    create: (dog: DogCreate): Promise<Dog> => {
      return apiFetch<Dog>('/api/dogs', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(dog),
      });
    },

    update: (id: string, dog: DogUpdate): Promise<Dog> => {
      return apiFetch<Dog>(`/api/dogs/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(dog),
      });
    },

    delete: (id: string): Promise<void> => {
      return apiFetch<void>(`/api/dogs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    },
  },

  // Vet endpoints
  vets: {
    getAll: (): Promise<Vet[]> => {
      return apiFetch<Vet[]>('/api/vets', {
        headers: getAuthHeader(),
      });
    },

    getById: (id: string): Promise<Vet> => {
      return apiFetch<Vet>(`/api/vets/${id}`, {
        headers: getAuthHeader(),
      });
    },

    create: (vet: VetCreate): Promise<Vet> => {
      return apiFetch<Vet>('/api/vets', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(vet),
      });
    },

    update: (id: string, vet: VetUpdate): Promise<Vet> => {
      return apiFetch<Vet>(`/api/vets/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(vet),
      });
    },

    delete: (id: string): Promise<void> => {
      return apiFetch<void>(`/api/vets/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    },
  },

  // Medicine endpoints
  medicines: {
    getAll: (): Promise<Medicine[]> => {
      return apiFetch<Medicine[]>('/api/medicines', {
        headers: getAuthHeader(),
      });
    },

    getById: (id: string): Promise<Medicine> => {
      return apiFetch<Medicine>(`/api/medicines/${id}`, {
        headers: getAuthHeader(),
      });
    },

    create: (medicine: MedicineCreate): Promise<Medicine> => {
      return apiFetch<Medicine>('/api/medicines', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(medicine),
      });
    },

    update: (id: string, medicine: MedicineUpdate): Promise<Medicine> => {
      return apiFetch<Medicine>(`/api/medicines/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(medicine),
      });
    },

    delete: (id: string): Promise<void> => {
      return apiFetch<void>(`/api/medicines/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    },
  },

  // Upload endpoint
  upload: {
    image: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      const url = `${API_URL}/api/upload/image`;
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });

      if (!response.ok) {
        // Handle specific HTTP status codes with friendly messages
        let errorMessage = 'Upload failed';

        if (response.status === 413) {
          errorMessage = 'File is too large. Maximum size is 2MB.';
        } else {
          // Try to parse JSON error response
          const error = await response.json().catch(() => null);
          if (error?.detail) {
            errorMessage = error.detail;
          } else {
            errorMessage = `Upload failed (HTTP ${response.status})${response.statusText ? ': ' + response.statusText : ''}`;
          }
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    },
  },

  // Event endpoints
  events: {
    getAll: (dogId?: string): Promise<Event[]> => {
      const params = dogId ? `?dog_id=${dogId}` : '';
      return apiFetch<Event[]>(`/api/events${params}`, {
        headers: getAuthHeader(),
      });
    },

    getById: (id: string): Promise<Event> => {
      return apiFetch<Event>(`/api/events/${id}`, {
        headers: getAuthHeader(),
      });
    },

    create: (event: EventCreate): Promise<Event> => {
      return apiFetch<Event>('/api/events', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(event),
      });
    },

    update: (id: string, event: EventUpdate): Promise<Event> => {
      return apiFetch<Event>(`/api/events/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(event),
      });
    },

    delete: (id: string): Promise<void> => {
      return apiFetch<void>(`/api/events/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    },
  },

  // Vet Visit endpoints
  vetVisits: {
    getAll: (dogId?: string): Promise<VetVisit[]> => {
      const params = dogId ? `?dog_id=${dogId}` : '';
      return apiFetch<VetVisit[]>(`/api/vet-visits${params}`, {
        headers: getAuthHeader(),
      });
    },

    getById: (id: string): Promise<VetVisit> => {
      return apiFetch<VetVisit>(`/api/vet-visits/${id}`, {
        headers: getAuthHeader(),
      });
    },

    create: (vetVisit: VetVisitCreate): Promise<VetVisit> => {
      return apiFetch<VetVisit>('/api/vet-visits', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(vetVisit),
      });
    },

    update: (id: string, vetVisit: VetVisitUpdate): Promise<VetVisit> => {
      return apiFetch<VetVisit>(`/api/vet-visits/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(vetVisit),
      });
    },

    delete: (id: string): Promise<void> => {
      return apiFetch<void>(`/api/vet-visits/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    },
  },

  // Medicine Event endpoints
  medicineEvents: {
    getAll: (dogId?: string): Promise<MedicineEvent[]> => {
      const params = dogId ? `?dog_id=${dogId}` : '';
      return apiFetch<MedicineEvent[]>(`/api/medicine-events${params}`, {
        headers: getAuthHeader(),
      });
    },

    getById: (id: string): Promise<MedicineEvent> => {
      return apiFetch<MedicineEvent>(`/api/medicine-events/${id}`, {
        headers: getAuthHeader(),
      });
    },

    create: (medicineEvent: MedicineEventCreate): Promise<MedicineEvent> => {
      return apiFetch<MedicineEvent>('/api/medicine-events', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(medicineEvent),
      });
    },

    update: (id: string, medicineEvent: MedicineEventUpdate): Promise<MedicineEvent> => {
      return apiFetch<MedicineEvent>(`/api/medicine-events/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(medicineEvent),
      });
    },

    delete: (id: string): Promise<void> => {
      return apiFetch<void>(`/api/medicine-events/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    },
  },

  // Custom Event endpoints
  customEvents: {
    getAll: (): Promise<CustomEvent[]> => {
      return apiFetch<CustomEvent[]>('/api/custom-events', {
        headers: getAuthHeader(),
      });
    },

    getById: (id: string): Promise<CustomEvent> => {
      return apiFetch<CustomEvent>(`/api/custom-events/${id}`, {
        headers: getAuthHeader(),
      });
    },

    create: (customEvent: CustomEventCreate): Promise<CustomEvent> => {
      return apiFetch<CustomEvent>('/api/custom-events', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(customEvent),
      });
    },

    update: (id: string, customEvent: CustomEventUpdate): Promise<CustomEvent> => {
      return apiFetch<CustomEvent>(`/api/custom-events/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(customEvent),
      });
    },

    delete: (id: string): Promise<void> => {
      return apiFetch<void>(`/api/custom-events/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    },
  },
};
