// Appointment Category Types

export interface AppCategory {
    id: string;
    key: string;
    label: string;
    image: string;
    doctor_count: number;
    created_at?: string;
    updated_at?: string;
}

// DTO for creating categories
export interface CreateAppCategoryDTO {
    key: string;
    label: string;
    image: string | File;
}

// DTO for updating categories
export interface UpdateAppCategoryDTO extends Partial<CreateAppCategoryDTO> {
    id: string;
}
