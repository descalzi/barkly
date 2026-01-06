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
    return `http://${hostname}:8000`;
  }

  // 4. Local IP: http://192.168.x.x:8000
  if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return `http://${hostname}:8000`;
  }

  // 5. Default: http://localhost:8000
  return 'http://localhost:8000';
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
        const error = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(error.detail || 'Upload failed');
      }

      return await response.json();
    },
  },

  // Event endpoints (Phase 4+)
  events: {
    // TODO: Implement in Phase 4
  },

  // Vet Visit endpoints (Phase 4+)
  vetVisits: {
    // TODO: Implement in Phase 4
  },

  // Medicine Event endpoints (Phase 4+)
  medicineEvents: {
    // TODO: Implement in Phase 4
  },
};
