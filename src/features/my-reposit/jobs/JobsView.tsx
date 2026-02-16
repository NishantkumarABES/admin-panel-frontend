import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, Plus } from "lucide-react";
import type { JobPost, JobAnalytics, CreateJobDTO, JobPostStatus, JobFunction } from "./jobs.types";
import { JOB_FUNCTIONS, JOB_STATUS_OPTIONS } from "./jobs.types";
import { SPECIALTIES } from "../../Advertisements/advertisement.types";
import * as jobService from "../../../services/job.service";
import toast from "react-hot-toast";
import AddEditJobModal from "./components/AddEditJobModal";
import JobApplicationsModal from "./components/JobApplicationsModal";
import JobsTable from "./components/JobsTable";

export default function JobsView() {
    const [jobs, setJobs] = useState<JobPost[]>([]);
    const [loading, setLoading] = useState(true);

    // Analytics
    const [analytics, setAnalytics] = useState<JobAnalytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    // Filters state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<JobPostStatus | "">("");
    const [functionFilter, setFunctionFilter] = useState<JobFunction | "">("");
    const [specialtyFilter, setSpecialtyFilter] = useState("");

    // Modal state
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPost | null>(null);
    const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
    const [selectedJobForApps, setSelectedJobForApps] = useState<JobPost | null>(null);

    // Track if this is the initial mount
    const isInitialMount = useRef(true);

    const fetchAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const data = await jobService.getJobsAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error("Failed to fetch job analytics:", error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await jobService.getJobs({
                page: currentPage,
                page_size: pageSize,
                search: searchQuery || undefined,
                status: statusFilter || undefined,
                job_function: functionFilter || undefined,
                speciality: specialtyFilter || undefined,
                ordering: "-created_at",
            });

            setJobs(response.results || []);
            setTotalCount(response.count);
            setHasNext(!!response.next);
            setHasPrevious(!!response.previous);
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, statusFilter, functionFilter, specialtyFilter]);

    // Fetch analytics on mount
    useEffect(() => {
        fetchAnalytics();
    }, []);

    // Fetch jobs on mount immediately, then debounce on subsequent changes
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchJobs();
            return;
        }

        const timer = setTimeout(() => {
            fetchJobs();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchJobs]);

    // Reset page to 1 when filters change (not pagination)
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, functionFilter, specialtyFilter]);

    const handleCreateJob = async (data: CreateJobDTO) => {
        try {
            await jobService.createJob(data);
            toast.success("Job created successfully");
            fetchJobs();
            fetchAnalytics();
        } catch (error) {
            console.error("Failed to create job:", error);
            toast.error("Failed to create job");
            throw error;
        }
    };

    const handleUpdateJob = async (data: CreateJobDTO) => {
        if (!editingJob) return;
        try {
            await jobService.updateJob(editingJob.id, data);
            toast.success("Job updated successfully");
            fetchJobs();
            fetchAnalytics();
        } catch (error) {
            console.error("Failed to update job:", error);
            toast.error("Failed to update job");
            throw error;
        }
    };

    const handleOpenAddModal = () => {
        setEditingJob(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (job: JobPost) => {
        setEditingJob(job);
        setIsAddEditModalOpen(true);
    };

    const handleRefresh = () => {
        fetchJobs();
        fetchAnalytics();
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const hasActiveFilters = searchQuery || statusFilter || functionFilter || specialtyFilter;

    const handleClearFilters = () => {
        setSearchQuery("");
        setStatusFilter("");
        setFunctionFilter("");
        setSpecialtyFilter("");
    };

    return (
        <div className="space-y-6 min-w-0 max-w-full">
            {/* Analytics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Total Jobs</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                            {analytics?.total_jobs || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Published</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-emerald-600 mt-1">
                            {analytics?.published_jobs || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">In Review</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-blue-600 mt-1">
                            {analytics?.in_review_jobs || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Draft</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-teal-600 mt-1">
                            {analytics?.draft_jobs || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Rejected</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-red-600 mt-1">
                            {analytics?.rejected_jobs || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Closed</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-gray-600 mt-1">
                            {analytics?.closed_jobs || 0}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                    <div className="text-sm text-gray-600 mb-1">Expired</div>
                    {analyticsLoading ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-purple-600 mt-1">
                            {analytics?.expired_jobs || 0}
                        </div>
                    )}
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 min-w-0">
                    {/* Left side: Search + Filters */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap sm:gap-4 min-w-0 flex-1">
                        {/* Search */}
                        <div className="flex-1 min-w-0 w-full sm:min-w-75 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, company..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                        </div>

                        {/* Filters group */}
                        <div className="flex flex-wrap items-center gap-4 min-w-0">
                            {/* Specialty Filter */}
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-48">
                                <Filter className="w-5 h-5 text-gray-400 shrink-0" />
                                <select
                                    value={specialtyFilter}
                                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                >
                                    <option value="">All Specialties</option>
                                    {SPECIALTIES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Job Function Filter */}
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                                <select
                                    value={functionFilter}
                                    onChange={(e) => setFunctionFilter(e.target.value as JobFunction | "")}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                >
                                    <option value="">All Functions</option>
                                    {JOB_FUNCTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-40">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as JobPostStatus | "")}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                >
                                    {JOB_STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right side: Post Job Button */}
                    <div className="flex justify-end lg:justify-normal shrink-0">
                        <button
                            onClick={handleOpenAddModal}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Post Job
                        </button>
                    </div>
                </div>
            </div>

            {/* Jobs Table */}
            <JobsTable
                jobs={jobs}
                loading={loading}
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
                onRefresh={handleRefresh}
                onEdit={handleOpenEditModal}
                onViewApplications={(job) => {
                    setSelectedJobForApps(job);
                    setIsApplicationsModalOpen(true);
                }}
            />

            {/* Add/Edit Modal */}
            <AddEditJobModal
                isOpen={isAddEditModalOpen}
                onClose={() => {
                    setIsAddEditModalOpen(false);
                    setEditingJob(null);
                }}
                onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
                job={editingJob}
            />

            {/* Applications Modal */}
            <JobApplicationsModal
                isOpen={isApplicationsModalOpen}
                onClose={() => {
                    setIsApplicationsModalOpen(false);
                    setSelectedJobForApps(null);
                }}
                job={selectedJobForApps}
            />
        </div>
    );
}
