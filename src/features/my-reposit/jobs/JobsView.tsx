import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, Plus, HelpCircle, Briefcase, CheckCircle, Clock, FileEdit, XCircle, Lock, AlertTriangle } from "lucide-react";
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

    const statCards = [
        { label: "Total Jobs", value: analytics?.total_jobs || 0, icon: Briefcase, color: "#6b96ff", bg: "rgba(107, 150, 255, 0.08)", tooltip: "The total number of job postings in the system." },
        { label: "Published", value: analytics?.published_jobs || 0, icon: CheckCircle, color: "#4fcfa5", bg: "rgba(79, 207, 165, 0.08)", tooltip: "Jobs that have been reviewed and published for applicants." },
        { label: "In Review", value: analytics?.in_review_jobs || 0, icon: Clock, color: "#6b96ff", bg: "rgba(107, 150, 255, 0.08)", tooltip: "Jobs currently under admin review before publishing." },
        { label: "Draft", value: analytics?.draft_jobs || 0, icon: FileEdit, color: "#4fcfa5", bg: "rgba(79, 207, 165, 0.08)", tooltip: "Jobs saved as drafts, not yet submitted for review." },
        { label: "Rejected", value: analytics?.rejected_jobs || 0, icon: XCircle, color: "#ff7070", bg: "rgba(255, 112, 112, 0.08)", tooltip: "Jobs that have been rejected after review." },
        { label: "Closed", value: analytics?.closed_jobs || 0, icon: Lock, color: "#ffc554", bg: "rgba(255, 197, 84, 0.08)", tooltip: "Jobs that have been closed and are no longer accepting applications." },
        { label: "Expired", value: analytics?.expired_jobs || 0, icon: AlertTriangle, color: "#a285ff", bg: "rgba(162, 133, 255, 0.08)", tooltip: "Jobs that have passed their expiry date." },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                {statCards.map((stat) => (
                    <div key={stat.label} className="clay-card min-w-0">
                        <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
                            <div className="clay-circle" style={{ background: stat.bg }}>
                                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                            </div>
                            <div className="group relative">
                                <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                                <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 text-xs rounded-xl z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: "4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.7), 0 0 0 1px rgba(0,0,0,0.06)", color: "#374151" }}>
                                    {stat.tooltip}
                                </div>
                            </div>
                        </div>
                        {analyticsLoading ? (
                            <div className="clay-skeleton" style={{ height: "28px", marginBottom: "6px" }} />
                        ) : (
                            <div className="text-2xl font-bold" style={{ color: stat.color, marginBottom: "2px" }}>{stat.value}</div>
                        )}
                        <div className="text-xs" style={{ color: "#111827" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters and Actions */}
            <div className="clay-card min-w-0" style={{ padding: "14px 18px" }}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 min-w-0">
                    {/* Left side: Search + Filters */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap sm:gap-3 min-w-0 flex-1">
                        {/* Search */}
                        <div className="flex-1 min-w-0 w-full sm:min-w-75 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, company..."
                                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                style={{
                                    background: "#eff1f5",
                                    border: "none",
                                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                }}
                            />
                        </div>

                        {/* Filters group */}
                        <div className="flex flex-wrap items-center gap-3 min-w-0">
                            {/* Specialty Filter */}
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-48">
                                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                                <select
                                    value={specialtyFilter}
                                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                    style={{
                                        background: "#eff1f5",
                                        border: "none",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
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
                                    className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                    style={{
                                        background: "#eff1f5",
                                        border: "none",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
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
                                    className="flex-1 px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                                    style={{
                                        background: "#eff1f5",
                                        border: "none",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
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
                                    className="clay-btn text-sm whitespace-nowrap"
                                    style={{ padding: "6px 14px", fontSize: "13px" }}
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
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap shrink-0"
                            style={{
                                background: "#1f2937",
                                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                            }}
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
