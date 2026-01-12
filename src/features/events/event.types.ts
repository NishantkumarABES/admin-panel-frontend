// API Response Types
export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type EventType = "webinar" | "conference" | "cme" | "patient_education" | "workshop";
export type EventFormat = "live" | "recorded" | "hybrid";

export interface EventSpeaker {
  id: string;
  name: string;
  title: string;
  bio?: string;
  image?: string;
}

export interface EventImage {
  id: string;
  image: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: EventType;
  specialization: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  format: EventFormat;
  is_free: boolean;
  registration_fee: string;
  is_certificate_available: boolean;
  agenda: string;
  venue?: string;
  event_link?: string;
  status: EventStatus;
  speakers: EventSpeaker[];
  images: EventImage[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface EventAnalytics {
  total_events: number;
  upcoming_events: number;
  ongoing_events: number;
  completed_events: number;
  cancelled_events: number;
  success: boolean;
}

// Speaker form data for creating/editing
export interface SpeakerFormData {
  name: string;
  title: string;
  bio?: string;
  image?: File | null;
}

// DTO for creating/editing events
export interface CreateEventDTO {
  title: string;
  description: string;
  event_type: EventType;
  specialization: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  format: EventFormat;
  is_free: boolean;
  registration_fee: string;
  is_certificate_available: boolean;
  agenda: string;
  venue?: string;
  event_link?: string;
  is_featured: boolean;
  images?: File[];
  speakers?: SpeakerFormData[];
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  id: string;
}

// Mock data for testing
export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Advanced Cardiology Workshop 2026",
    description: "Comprehensive workshop on latest advances in cardiovascular medicine",
    event_type: "workshop",
    specialization: "Cardiology",
    start_date: "2026-02-15",
    end_date: "2026-02-15",
    start_time: "09:00",
    end_time: "17:00",
    duration_minutes: 480,
    format: "hybrid",
    is_free: false,
    registration_fee: "5000.00",
    is_certificate_available: true,
    agenda: "9:00 AM - Registration\n10:00 AM - Session 1: Heart Failure Management\n12:00 PM - Lunch Break\n1:00 PM - Session 2: Interventional Cardiology\n4:00 PM - Q&A Session",
    venue: "Medical Convention Center, Delhi",
    event_link: "https://meet.example.com/cardio-workshop",
    status: "upcoming",
    speakers: [
      {
        id: "s1",
        name: "Dr. Rajesh Kumar",
        title: "Chief Cardiologist, AIIMS Delhi",
        bio: "20+ years of experience in interventional cardiology"
      }
    ],
    images: [],
    is_featured: true,
    created_at: "2026-01-05T10:00:00Z",
    updated_at: "2026-01-05T10:00:00Z",
  },
  {
    id: "2",
    title: "Diabetes Management CME Program",
    description: "Continuing Medical Education on diabetes care and management",
    event_type: "cme",
    specialization: "Endocrinology",
    start_date: "2026-01-20",
    end_date: "2026-01-20",
    start_time: "14:00",
    end_time: "18:00",
    duration_minutes: 240,
    format: "live",
    is_free: true,
    registration_fee: "0.00",
    is_certificate_available: true,
    agenda: "2:00 PM - Introduction to Modern Diabetes Care\n3:00 PM - Case Studies\n4:00 PM - Treatment Protocols",
    event_link: "https://meet.example.com/diabetes-cme",
    status: "upcoming",
    speakers: [
      {
        id: "s2",
        name: "Dr. Priya Sharma",
        title: "Endocrinologist, Max Hospital",
      }
    ],
    images: [],
    is_featured: false,
    created_at: "2025-12-20T10:00:00Z",
    updated_at: "2025-12-20T10:00:00Z",
  },
  {
    id: "3",
    title: "Patient Awareness on Mental Health",
    description: "Educational session for patients and families on mental health awareness",
    event_type: "patient_education",
    specialization: "Psychiatry",
    start_date: "2025-12-28",
    end_date: "2025-12-28",
    start_time: "10:00",
    end_time: "12:00",
    duration_minutes: 120,
    format: "live",
    is_free: true,
    registration_fee: "0.00",
    is_certificate_available: false,
    agenda: "10:00 AM - Understanding Mental Health\n11:00 AM - When to Seek Help\n11:30 AM - Q&A",
    event_link: "https://meet.example.com/mental-health-education",
    venue: "Community Health Center, Mumbai",
    status: "completed",
    speakers: [
      {
        id: "s3",
        name: "Dr. Amit Verma",
        title: "Psychiatrist",
      }
    ],
    images: [],
    is_featured: false,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2025-12-28T14:00:00Z",
  },
];

export const EVENT_TYPES: EventType[] = [
  "webinar",
  "conference",
  "cme",
  "patient_education",
  "workshop"
];

export const EVENT_FORMATS: EventFormat[] = [
  "live",
  "recorded",
  "hybrid"
];

export const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Oncology",
  "Psychiatry",
  "Radiology",
  "General Medicine",
  "Surgery",
  "Emergency Medicine"
] as const;