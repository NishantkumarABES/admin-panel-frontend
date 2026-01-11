export type AdvisoryStatus = "active" | "inactive";

export interface AdvisoryMember {
  id: string;
  full_name: string;
  gender?: string;
  date_of_birth?: string;
  email: string;
  phone: string;
  specialization: string;
  years_of_experience: number;
  bio?: string;
  status: AdvisoryStatus;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAdvisoryDTO {
  full_name: string;
  gender: string;
  date_of_birth: string;
  email: string;
  phone: string;
  specialization: string;
  years_of_experience: number;
  bio?: string;
  image?: File;
  status?: AdvisoryStatus;
}

export interface UpdateAdvisoryDTO {
  id: string;
  full_name?: string;
  gender?: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  years_of_experience?: number;
  bio?: string;
  image?: File;
  status?: AdvisoryStatus;
}

export interface PaginatedAdvisory {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdvisoryMember[];
}

export interface AdvisoryAnalytics {
  total_members: number;
  active_members: number;
  inactive_members: number;
  success: boolean;
}

export interface AdvisoryFilters {
  search?: string;
  status?: AdvisoryStatus;
  specialization?: string;
  page?: number;
  page_size?: number;
}

// Mock data for development/fallback
export const mockAdvisoryMembers: AdvisoryMember[] = [
  {
    id: "1",
    full_name: "Dr. Sarah Johnson",
    gender: "female",
    date_of_birth: "1990-05-15",
    email: "sarah.johnson@clinic.com",
    phone: "+1234567890",
    specialization: "Cardiology",
    years_of_experience: 15,
    bio: "Board-certified cardiologist with extensive experience in cardiovascular disease management and preventive cardiology.",
    status: "active",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    full_name: "Dr. Michael Chen",
    gender: "male",
    date_of_birth: "1985-08-20",
    email: "michael.chen@clinic.com",
    phone: "+1234567891",
    specialization: "Neurology",
    years_of_experience: 12,
    bio: "Neurologist specializing in neurodegenerative diseases and stroke management.",
    status: "active",
    created_at: "2024-02-10T10:00:00Z",
    updated_at: "2024-02-10T10:00:00Z",
  },
  {
    id: "3",
    full_name: "Dr. Emily Rodriguez",
    gender: "female",
    date_of_birth: "1995-03-25",
    email: "emily.rodriguez@clinic.com",
    phone: "+1234567892",
    specialization: "Pediatrics",
    years_of_experience: 10,
    bio: "Pediatrician with focus on child development and preventive care.",
    status: "active",
    created_at: "2024-03-05T10:00:00Z",
    updated_at: "2024-03-05T10:00:00Z",
  },
  {
    id: "4",
    full_name: "Dr. James Wilson",
    gender: "male",
    date_of_birth: "1988-11-10",
    email: "james.wilson@clinic.com",
    phone: "+1234567893",
    specialization: "Orthopedics",
    years_of_experience: 18,
    bio: "Orthopedic surgeon specializing in sports medicine and joint replacement.",
    status: "inactive",
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-06-15T10:00:00Z",
  },
  {
    id: "5",
    full_name: "Dr. Lisa Anderson",
    gender: "female",
    date_of_birth: "1992-07-05",
    email: "lisa.anderson@clinic.com",
    phone: "+1234567894",
    specialization: "Dermatology",
    years_of_experience: 8,
    bio: "Dermatologist with expertise in medical and cosmetic dermatology.",
    status: "active",
    created_at: "2024-04-12T10:00:00Z",
    updated_at: "2024-04-12T10:00:00Z",
  },
];

export const mockAdvisoryAnalytics: AdvisoryAnalytics = {
  total_members: 5,
  active_members: 4,
  inactive_members: 1,
  success: true,
};
