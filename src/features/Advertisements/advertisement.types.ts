export interface GeneralAdvertisement {
  id: string;
  title: string;
  url: string;
  image: string;
  status: "enabled" | "disabled";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGeneralAdDTO {
  title: string;
  url: string;
  image: File;
  status: "enabled" | "disabled";
}

export interface UpdateGeneralAdDTO {
  id: string;
  title: string;
  url: string;
  image?: File;
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
  status?: string;
  search?: string;
}

// Mock data for development
export const mockGeneralAds: GeneralAdvertisement[] = [
  {
    id: "1",
    title: "Summer Sale 2025",
    url: "https://example.com/summer-sale",
    image: "/ads/summer-sale.jpg",
    status: "enabled",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "New Product Launch",
    url: "https://example.com/new-product",
    image: "/ads/new-product.jpg",
    status: "disabled",
    createdAt: "2025-01-10T14:30:00Z",
    updatedAt: "2025-01-10T14:30:00Z",
  },
];
