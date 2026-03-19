import { api } from "./api";
import type { JobPost, JobFilters, ReviewJobDTO, JobAnalytics, CreateJobDTO, UpdateJobDTO, JobApplication } from "../features/my-reposit/jobs/jobs.types";

interface PaginatedJobsData {
    count: number;
    next: string | null;
    previous: string | null;
    results: JobPost[];
}

interface PaginatedJobsResponse {
    detail: string;
    data: PaginatedJobsData;
    success: boolean;
}

// Get all jobs with optional filters
export const getJobs = async (filters?: JobFilters): Promise<PaginatedJobsData> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.page_size) params.append("page_size", filters.page_size.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.ordering) params.append("ordering", filters.ordering);
    if (filters?.speciality) params.append("speciality", filters.speciality);
    if (filters?.job_type) params.append("job_type", filters.job_type);
    if (filters?.job_function) params.append("job_function", filters.job_function);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.workplace_type) params.append("workplace_type", filters.workplace_type);

    const queryString = params.toString();

    const response = await api.get<PaginatedJobsResponse>(
        `/jobs/admin/jobs/${queryString ? `?${queryString}` : ""}`
    );

    return response.data.data;
};

// Get a single job
export const getJob = async (id: string): Promise<JobPost> => {
    const response = await api.get<JobPost>(`/jobs/admin/jobs/${id}/`);
    return response.data;
};

// Review a job (approve or reject)
export const reviewJob = async (id: string, data: ReviewJobDTO) => {
    const response = await api.patch(`/jobs/admin/jobs/${id}/review/`, data);
    return response.data;
};

export const moveJobToInReview = async (id: string) => {
    const response = await api.patch(`/jobs/admin/jobs/${id}/move/`);
    return response.data;
};

// Get job analytics
export const getJobsAnalytics = async (): Promise<JobAnalytics> => {
    const response = await api.get<JobAnalytics>("/analytics/admin/jobs/metrics/");
    return response.data;
};

// Create a job on behalf of a doctor user
export const createJob = async (data: CreateJobDTO) => {
    // Assuming the API accepts JSON for job creation since there are no files involved in job post creation itself (unlike books)
    // If there are files, we would use FormData. Job definitions usually just have text fields.
    const response = await api.post("/jobs/admin/create/", data);
    return response.data;
};

// Update a job (admin)
export const updateJob = async (id: string, data: UpdateJobDTO) => {
    const response = await api.patch(`/jobs/admin/jobs/${id}/update/`, data);
    return response.data;
};

// --- Job Applications ---

interface PaginatedApplications {
    count: number;
    next: string | null;
    previous: string | null;
    results: JobApplication[];
}

export const getJobApplications = async (jobId: string, page = 1): Promise<PaginatedApplications> => {
    const response = await api.get<PaginatedApplications>(`/jobs/admin/jobs/${jobId}/applications/?page=${page}`);
    return response.data;
};

// Update job application status
export const updateJobApplicationStatus = async (applicationId: string, status: JobApplication["status"]) => {
    // Assuming endpoint path here based on convention
    const response = await api.patch(`/jobs/admin/applications/${applicationId}/status/`, { status });
    return response.data;
};
