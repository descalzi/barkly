// User and Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface GoogleAuthRequest {
  token: string;
}

// Upload response
export interface UploadResponse {
  data: string; // Base64 encoded data URI
}

// Time of day enum
export enum TimeOfDay {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening',
  OVERNIGHT = 'Overnight',
}

// Event types (for Phase 4+, but defining now for completeness)
export enum EventType {
  POO = 'Poo',
  VOMIT = 'Vomit',
  ITCHY = 'Itchy',
  INJURY = 'Injury',
  OTHER = 'Other',
}

export enum VomitQuality {
  FOOD = 'Food',
  BILE = 'Bile',
  FOOD_BILE = 'Food+Bile',
  OTHER = 'Other',
}

export enum MedicineType {
  TABLET = 'tablet',
  DROP = 'drop',
  LIQUID = 'liquid',
  OTHER = 'other',
}

// Dog types
export interface Dog {
  id: string;
  user_id: string;
  name: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface DogCreate {
  name: string;
  profile_picture?: string;
}

export interface DogUpdate {
  name?: string;
  profile_picture?: string;
}

// Event types
export interface Event {
  id: string;
  dog_id: string;
  event_type?: EventType;
  custom_event_id?: string;
  date: string;
  time_of_day: TimeOfDay;
  poo_quality?: number; // 1-7
  vomit_quality?: VomitQuality;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EventCreate {
  dog_id: string;
  event_type?: EventType;
  custom_event_id?: string;
  date: string;
  time_of_day: TimeOfDay;
  poo_quality?: number;
  vomit_quality?: VomitQuality;
  notes?: string;
}

export interface EventUpdate {
  dog_id?: string;
  event_type?: EventType;
  custom_event_id?: string;
  date?: string;
  time_of_day?: TimeOfDay;
  poo_quality?: number;
  vomit_quality?: VomitQuality;
  notes?: string;
}

// Vet types
export interface Vet {
  id: string;
  user_id: string;
  name: string;
  contact_info?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VetCreate {
  name: string;
  contact_info?: string;
  notes?: string;
}

export interface VetUpdate {
  name?: string;
  contact_info?: string;
  notes?: string;
}

// Vet Visit types
export interface VetVisit {
  id: string;
  dog_id: string;
  vet_id: string;
  date: string;
  time_of_day: TimeOfDay;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VetVisitCreate {
  dog_id: string;
  vet_id: string;
  date: string;
  time_of_day: TimeOfDay;
  notes?: string;
}

export interface VetVisitUpdate {
  dog_id?: string;
  vet_id?: string;
  date?: string;
  time_of_day?: TimeOfDay;
  notes?: string;
}

// Medicine types
export interface Medicine {
  id: string;
  user_id: string;
  name: string;
  type: MedicineType;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicineCreate {
  name: string;
  type: MedicineType;
  description?: string;
}

export interface MedicineUpdate {
  name?: string;
  type?: MedicineType;
  description?: string;
}

// Medicine Event types
export interface MedicineEvent {
  id: string;
  dog_id: string;
  medicine_id: string;
  date: string;
  time_of_day: TimeOfDay;
  dosage: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicineEventCreate {
  dog_id: string;
  medicine_id: string;
  date: string;
  time_of_day: TimeOfDay;
  dosage: number;
  notes?: string;
}

export interface MedicineEventUpdate {
  dog_id?: string;
  medicine_id?: string;
  date?: string;
  time_of_day?: TimeOfDay;
  dosage?: number;
  notes?: string;
}

// Custom Event types
export interface CustomEvent {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CustomEventCreate {
  name: string;
}

export interface CustomEventUpdate {
  name?: string;
}
