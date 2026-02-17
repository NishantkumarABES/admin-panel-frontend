export type JobPostStatus = "draft" | "in_review" | "published" | "rejected" | "expired" | "closed";

export type WorkplaceType = "on_site" | "hybrid" | "remote";

export type EmploymentType = "full_time" | "part_time" | "contract" | "temporary" | "internship" | "fellowship";

export type JobFunction = "clinical" | "academic" | "research" | "industry" | "public_health" | "administration";

export type SeniorityLevel = "intern" | "junior" | "mid" | "senior" | "lead" | "director" | "consultant";

export type ApplyMethod = "platform" | "external_link" | "email";

export interface JobPost {
    id: string;
    created_by: string; // User ID
    created_by_name?: string; // Additional field for display
    title: string;
    company_name: string;
    workplace_type: WorkplaceType;
    employment_type: EmploymentType;
    job_location: string;
    job_function: JobFunction;
    speciality: string;
    seniority_level: SeniorityLevel;
    experience?: string | null;
    job_description: string;
    must_have_skills: string;
    salary_range?: string | null;
    required_degrees: string;
    application_deadline?: string | null;
    recruiter_name: string;
    apply_method: ApplyMethod;
    external_apply_link?: string | null;
    application_email?: string | null;
    status: JobPostStatus;
    rejection_reason?: string | null;
    tags: string;
    views: number;
    applications_count: number;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface JobFilters {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
    speciality?: string;
    job_type?: EmploymentType;
    job_function?: JobFunction;
    status?: JobPostStatus;
    workplace_type?: WorkplaceType;
}

export interface CreateJobDTO {
    user_id: string;
    title: string;
    company_name: string;
    workplace_type: WorkplaceType;
    employment_type: EmploymentType;
    job_location: string;
    job_function: JobFunction;
    speciality: string;
    seniority_level: SeniorityLevel;
    experience?: string;
    job_description: string;
    must_have_skills: string;
    salary_range?: string;
    required_degrees: string;
    application_deadline?: string;
    recruiter_name?: string;
    apply_method: ApplyMethod;
    external_apply_link?: string;
    application_email?: string;
    tags?: string;
}

export interface UpdateJobDTO {
    title?: string;
    company_name?: string;
    workplace_type?: WorkplaceType;
    employment_type?: EmploymentType;
    job_location?: string;
    job_function?: JobFunction;
    speciality?: string;
    seniority_level?: SeniorityLevel;
    experience?: string;
    job_description?: string;
    must_have_skills?: string;
    salary_range?: string;
    required_degrees?: string;
    application_deadline?: string;
    recruiter_name?: string;
    apply_method?: ApplyMethod;
    external_apply_link?: string;
    application_email?: string;
    tags?: string;
}

export interface ReviewJobDTO {
    status: "published" | "rejected";
    rejection_reason?: string;
}

export interface JobAnalytics {
    total_jobs: number;
    published_jobs: number;
    pending_jobs: number;
    draft_jobs: number;
    rejected_jobs: number;
    in_review_jobs: number;
    expired_jobs: number;
    closed_jobs: number;
}

export type JobApplicationStatus = "pending" | "approved" | "rejected";

export interface JobApplicationJob {
    id: string;
    title: string;
    company_name: string;
    workplace_type: WorkplaceType;
    employment_type: EmploymentType;
    job_location: string;
    job_function: JobFunction;
    speciality: string;
    seniority_level: SeniorityLevel;
    salary_range?: string | null;
    application_deadline?: string | null;
    views: number;
    applications_count: number;
    created_at: string;
    created_by: string;
    tags: string;
    status: JobPostStatus;
}

export interface JobApplication {
    id: string;
    job: JobApplicationJob;
    applicant: string;
    applicant_name?: string;
    applicant_email?: string;
    resume?: string | null;
    additional_information?: string | null;
    years_of_experience?: string | null;
    current_position?: string | null;
    current_institution?: string | null;
    notice_period?: string | null;
    expected_salary?: string | null;
    additional_document?: string | null;
    status?: JobApplicationStatus;
    created_at: string;
}

export const WORKPLACE_TYPES: { value: WorkplaceType; label: string }[] = [
    { value: "on_site", label: "On-site" },
    { value: "hybrid", label: "Hybrid" },
    { value: "remote", label: "Remote" },
];

export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
    { value: "full_time", label: "Full-time" },
    { value: "part_time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "temporary", label: "Temporary" },
    { value: "internship", label: "Internship" },
    { value: "fellowship", label: "Fellowship" },
];

export const JOB_FUNCTIONS: { value: JobFunction; label: string }[] = [
    { value: "clinical", label: "Clinical" },
    { value: "academic", label: "Academic" },
    { value: "research", label: "Research" },
    { value: "industry", label: "Industry" },
    { value: "public_health", label: "Public Health" },
    { value: "administration", label: "Administration" },
];

export const SENIORITY_LEVELS: { value: SeniorityLevel; label: string }[] = [
    { value: "intern", label: "Intern" },
    { value: "junior", label: "Junior" },
    { value: "mid", label: "Mid" },
    { value: "senior", label: "Senior" },
    { value: "lead", label: "Lead" },
    { value: "director", label: "Director" },
    { value: "consultant", label: "Consultant" },
];

export const APPLY_METHODS: { value: ApplyMethod; label: string }[] = [
    { value: "platform", label: "Apply via Platform" },
    { value: "external_link", label: "External Link" },
    { value: "email", label: "Email Application" },
];

export const JOB_STATUS_OPTIONS: { value: JobPostStatus | ""; label: string }[] = [
    { value: "", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "in_review", label: "In Review" },
    { value: "published", label: "Published" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
    { value: "closed", label: "Closed" },
];
