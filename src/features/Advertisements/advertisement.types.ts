export interface GeneralAdvertisement {
  id: string;
  title: string;
  url: string;
  image: string;
  specializations: string[];
  status: "enabled" | "disabled";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGeneralAdDTO {
  title: string;
  url: string;
  image: File;
  specializations: string[];
  status: "enabled" | "disabled";
}

export interface UpdateGeneralAdDTO {
  id: string;
  title: string;
  url: string;
  image?: File;
  specializations: string[];
  status: "enabled" | "disabled";
}

export interface SpecialityAdvertisement {
  id: string;
  title: string;
  url: string;
  image: string;
  speciality: string;
  status: "enabled" | "disabled";
  createdAt?: string;
  updatedAt?: string;
}

export interface AdFilters {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
// Mock data for development
export const mockGeneralAds: GeneralAdvertisement[] = [
  {
    id: "1",
    title: "Summer Sale 2025",
    url: "https://example.com/summer-sale",
    image: "/ads/summer-sale.jpg",
    specializations: ["Cardiology", "Neurology"],
    status: "enabled",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "New Product Launch",
    url: "https://example.com/new-product",
    image: "/ads/new-product.jpg",
    specializations: ["General Medicine"],
    status: "disabled",
    createdAt: "2025-01-10T14:30:00Z",
    updatedAt: "2025-01-10T14:30:00Z",
  },
];



export const SPECIALTIES = [
  "Multispecialty",
  "General Medicine",
  "General Surgery",
  "Cardiology",
  "Nephrology",
  "Neurology",
  "Endocrinology",
  "Medical Oncology",
  "Pediatrics and Adolescent Medicine",
  "Family Medicine and Geriatric Medicine",
  "Emergency Medicine",
  "Anaesthesiology",
  "Intensive Care Medicine",
  "Dermatology",
  "Cosmetology",
  "Pulmonology",
  "Rheumatology",
  "Diagnostic & Clinical Radiology",
  "Interventional Radiology",
  "Forensic Medicine & Toxicology",
  "Microbiology & Hospital Infection Control",
  "Pathology & Oncopathology",
  "Haematology",
  "Biochemistry",
  "Radiation Oncology",
  "Nuclear Medicine",
  "Psychiatry",
  "Clinical Psychology",
  "Clinical Pharmacology",
  "Ophthalmology",
  "Neurosurgery",
  "Cardiothoracic Surgery",
  "Vascular Surgery",
  "Orthopaedic Surgery",
  "ENT",
  "Head and Neck Surgery",
  "Plastic & Cosmetic Surgery",
  "Urology & Transplant Surgery",
  "Gastrointestinal Surgery & Transplant Surgery",
  "Paediatric Surgery",
  "Surgical Oncology",
  "Maxillofacial Surgery",
  "Dentistry & Somatology",
  "Obstetrics & Gynaecology",
  "Geriatric & Palliative Medicine",
  "Physiotherapy & Rehabilitation",
  "Nutrition & Dietetics",
  "Sports Medicine",
  "Gastroenterology",
] as const;   