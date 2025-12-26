export type PatientStatus = "active" | "inactive" | "suspended";

export interface PatientForm {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: PatientStatus;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  createdAt?: string;
}

export interface CreatePatientDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
}

export interface UpdatePatientDTO extends CreatePatientDTO {
  id: string;
  status?: PatientStatus;
}

export interface PatientFilters {
  status?: string;
  search?: string;
}

// Mock data for development
export const mockPatients: PatientForm[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    status: "active",
    dateOfBirth: "1985-03-15",
    gender: "Male",
    address: "123 Main St, New York, NY 10001",
    emergencyContact: "+1 (555) 987-6543",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 234-5678",
    status: "active",
    dateOfBirth: "1990-07-22",
    gender: "Female",
    address: "456 Oak Ave, Los Angeles, CA 90001",
    emergencyContact: "+1 (555) 876-5432",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.j@example.com",
    phone: "+1 (555) 345-6789",
    status: "inactive",
    dateOfBirth: "1978-11-30",
    gender: "Male",
    address: "789 Pine Rd, Chicago, IL 60601",
    emergencyContact: "+1 (555) 765-4321",
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Brown",
    email: "emily.brown@example.com",
    phone: "+1 (555) 456-7890",
    status: "active",
    dateOfBirth: "1995-05-18",
    gender: "Female",
    address: "321 Elm St, Houston, TX 77001",
    emergencyContact: "+1 (555) 654-3210",
    createdAt: "2024-04-05",
  }
];
