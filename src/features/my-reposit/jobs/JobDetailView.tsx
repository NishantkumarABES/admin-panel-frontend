import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Briefcase,
    Eye,
    Users,
    MapPin,
    Building2,
    GraduationCap,
    Clock,
    Calendar,
    Mail,
    ExternalLink,
    FileText,
    ChevronLeft,
    ChevronRight,
    Tag,
    AlertTriangle,
    Edit,
} from "lucide-react";
import type { JobPost, JobApplication, JobPostStatus, CreateJobDTO } from "./jobs.types";
import {
    EMPLOYMENT_TYPES,
    WORKPLACE_TYPES,
    JOB_FUNCTIONS,
    SENIORITY_LEVELS,
    APPLY_METHODS,
} from "./jobs.types";
import * as jobService from "../../../services/job.service";
import AddEditJobModal from "./components/AddEditJobModal";
import toast from "react-hot-toast";

// ── Helpers ────────────────────────────────────────────────────
function getLabelFromOptions<T extends string>(
    options: { value: T; label: string }[],
    value: T | undefined | null
): string {
    if (!value) return "—";
    return options.find((opt) => opt.value === value)?.label || String(value).replace(/_/g, " ");
}

function getStatusColor(status: JobPostStatus) {
    const map: Record<JobPostStatus, { bg: string; text: string }> = {
        draft: { bg: "bg-gray-100", text: "text-gray-800" },
        in_review: { bg: "bg-blue-100", text: "text-blue-800" },
        published: { bg: "bg-emerald-100", text: "text-emerald-800" },
        rejected: { bg: "bg-red-100", text: "text-red-800" },
        expired: { bg: "bg-purple-100", text: "text-purple-800" },
        closed: { bg: "bg-gray-100", text: "text-gray-600" },
    };
    return map[status] ?? map.draft;
}

const STATUS_LABELS: Record<JobPostStatus, string> = {
    draft: "Draft",
    in_review: "In Review",
    published: "Published",
    rejected: "Rejected",
    expired: "Expired",
    closed: "Closed",
};

const insetPanel = {
    background: "#f8f9fb",
    boxShadow:
        "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
};

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

// ── Info Item ──────────────────────────────────────────────────
function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number | undefined | null | React.ReactNode;
}) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-start gap-2">
            <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
                <div className="text-xs text-gray-500">{label}</div>
                <div className="text-sm text-gray-900">{value}</div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────
export default function JobDetailView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [job, setJob] = useState<JobPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Applications state
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [appsLoading, setAppsLoading] = useState(true);
    const [appsPage, setAppsPage] = useState(1);
    const [appsTotalPages, setAppsTotalPages] = useState(1);
    const [appsTotalCount, setAppsTotalCount] = useState(0);

    const fetchJob = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await jobService.getJob(id);
            setJob(data);
        } catch (error) {
            console.error("Failed to fetch job:", error);
            toast.error("Failed to load job details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchApplications = useCallback(async () => {
        if (!id) return;
        try {
            setAppsLoading(true);
            const response = await jobService.getJobApplications(id, appsPage);
            setApplications(response.results);
            setAppsTotalCount(response.count);
            setAppsTotalPages(Math.ceil(response.count / 10));
        } catch (error) {
            console.error("Failed to fetch applications:", error);
        } finally {
            setAppsLoading(false);
        }
    }, [id, appsPage]);

    useEffect(() => {
        fetchJob();
    }, [fetchJob]);

    const handleUpdateJob = async (data: CreateJobDTO) => {
        if (!job) return;
        try {
            await jobService.updateJob(job.id, data);
            toast.success("Job updated successfully");
            fetchJob();
        } catch (error) {
            console.error("Failed to update job:", error);
            toast.error("Failed to update job");
            throw error;
        }
    };

    useEffect(() => {
        if (id) fetchApplications();
    }, [fetchApplications]);

    // ── Loading Skeleton ───────────────────────────────────────
    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">
                <div className="flex items-center gap-3">
                    <div className="w-28 h-8 clay-skeleton rounded-xl" />
                </div>
                <div className="clay-card">
                    <div className="flex items-start gap-6 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-3 pt-1">
                            <div className="w-64 h-6 bg-gray-200 rounded" />
                            <div className="w-40 h-4 bg-gray-100 rounded" />
                            <div className="flex gap-2 mt-2">
                                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="clay-card animate-pulse">
                            <div className="w-8 h-8 bg-gray-200 rounded-full mb-3" />
                            <div className="w-20 h-5 bg-gray-200 rounded mb-1" />
                            <div className="w-16 h-3 bg-gray-100 rounded" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="clay-card animate-pulse space-y-3">
                        <div className="w-32 h-4 bg-gray-200 rounded" />
                        <div className="w-full h-32 bg-gray-100 rounded-xl" />
                    </div>
                    <div className="clay-card animate-pulse space-y-3">
                        <div className="w-32 h-4 bg-gray-200 rounded" />
                        <div className="w-full h-32 bg-gray-100 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    // ── Not Found ──────────────────────────────────────────────
    if (!job) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">
                <div className="clay-card text-center py-16">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Job Not Found</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        The job you're looking for doesn't exist or has been removed.
                    </p>
                    <button
                        onClick={() => navigate("/my-reposit/jobs")}
                        className="clay-btn inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Jobs
                    </button>
                </div>
            </div>
        );
    }

    const tagsArray = job.tags ? String(job.tags).split(",").filter((t) => t.trim()) : [];
    const { bg: statusBg, text: statusText } = getStatusColor(job.status);

    // ── Main Render ────────────────────────────────────────────
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="min-w-0 max-w-full">

            {/* ── Breadcrumb / Back ─────────────────────────────── */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate("/my-reposit/jobs")}
                    className="clay-btn flex items-center gap-2 text-sm"
                    style={{ padding: "6px 14px", fontSize: "13px" }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-gray-500">Jobs</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">
                        {job.title}
                    </span>
                </button>

                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all whitespace-nowrap"
                    style={{
                        background: "#1f2937",
                        boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                    }}
                >
                    <Edit className="w-4 h-4" />
                    Edit Job
                </button>
            </div>

            {/* ── Job Header ────────────────────────────────────── */}
            <div className="clay-card">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                    {/* Icon */}
                    <div
                        className="flex items-center justify-center w-14 h-14 rounded-xl shrink-0"
                        style={{
                            background: "#f8f9fb",
                            boxShadow: "3px 3px 8px rgba(0,0,0,0.06), -3px -3px 8px rgba(255,255,255,0.8)",
                        }}
                    >
                        <Briefcase className="w-7 h-7 text-gray-500" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h1>
                                <p className="text-sm text-gray-500">
                                    {job.company_name} · {job.job_location}
                                </p>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBg} ${statusText}`}>
                                {STATUS_LABELS[job.status] || job.status}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                {getLabelFromOptions(EMPLOYMENT_TYPES, job.employment_type)}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                {getLabelFromOptions(WORKPLACE_TYPES, job.workplace_type)}
                            </span>
                            {job.is_deleted && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Deleted
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Stats Cards ───────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="clay-card min-w-0">
                    <div className="clay-circle mb-2" style={{ background: "rgba(107, 150, 255, 0.08)" }}>
                        <Eye className="w-4 h-4" style={{ color: "#6b96ff" }} />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{job.views ?? 0}</div>
                    <div className="text-xs text-gray-500">Views</div>
                </div>
                <div className="clay-card min-w-0">
                    <div className="clay-circle mb-2" style={{ background: "rgba(162, 133, 255, 0.08)" }}>
                        <Users className="w-4 h-4" style={{ color: "#a285ff" }} />
                    </div>
                    <div className="text-lg font-bold" style={{ color: "#a285ff" }}>{job.applications_count ?? 0}</div>
                    <div className="text-xs text-gray-500">Applications</div>
                </div>
                <div className="clay-card min-w-0">
                    <div className="clay-circle mb-2" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
                        <Clock className="w-4 h-4" style={{ color: "#4fcfa5" }} />
                    </div>
                    <div className="text-lg font-bold" style={{ color: "#4fcfa5" }}>
                        {job.experience ? `${job.experience}` : "—"}
                    </div>
                    <div className="text-xs text-gray-500">Experience</div>
                </div>
                <div className="clay-card min-w-0">
                    <div className="clay-circle mb-2" style={{ background: "rgba(255, 197, 84, 0.08)" }}>
                        <Tag className="w-4 h-4" style={{ color: "#ffc554" }} />
                    </div>
                    <div className="text-lg font-bold" style={{ color: "#ffc554" }}>
                        {job.salary_range || "—"}
                    </div>
                    <div className="text-xs text-gray-500">Salary Range</div>
                </div>
            </div>

            {/* ── Two-Column Detail Grid ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Left — Job Information */}
                <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h3
                        className="text-sm font-semibold text-gray-900 pb-2"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        Job Information
                    </h3>

                    <div className="rounded-xl px-4 py-3" style={insetPanel}>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <InfoItem icon={Users} label="Posted By" value={job.created_by_name || job.created_by} />
                            <InfoItem icon={Building2} label="Company" value={job.company_name} />
                            <InfoItem icon={MapPin} label="Location" value={job.job_location} />
                            <InfoItem icon={Briefcase} label="Workplace Type" value={getLabelFromOptions(WORKPLACE_TYPES, job.workplace_type)} />
                            <InfoItem icon={Briefcase} label="Employment Type" value={getLabelFromOptions(EMPLOYMENT_TYPES, job.employment_type)} />
                            <InfoItem icon={Briefcase} label="Job Function" value={getLabelFromOptions(JOB_FUNCTIONS, job.job_function)} />
                            <InfoItem icon={Briefcase} label="Seniority Level" value={getLabelFromOptions(SENIORITY_LEVELS, job.seniority_level)} />
                            <InfoItem icon={Briefcase} label="Specialty" value={job.speciality} />
                            <InfoItem icon={GraduationCap} label="Required Degrees" value={job.required_degrees} />
                            <InfoItem icon={Users} label="Recruiter" value={job.recruiter_name} />
                        </div>
                    </div>

                    {/* Application Deadline */}
                    {job.application_deadline && (
                        <div className="rounded-xl px-4 py-3" style={insetPanel}>
                            <InfoItem
                                icon={Calendar}
                                label="Application Deadline"
                                value={new Date(job.application_deadline).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            />
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="rounded-xl px-4 py-3" style={insetPanel}>
                        <div className="space-y-3">
                            <InfoItem icon={Calendar} label="Created" value={job.created_at ? formatDateTime(job.created_at) : undefined} />
                            <InfoItem icon={Calendar} label="Last Updated" value={job.updated_at ? formatDateTime(job.updated_at) : undefined} />
                            <div className="flex items-start gap-2">
                                <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-xs text-gray-500">Job ID</div>
                                    <div className="text-xs text-gray-500 font-mono">{job.id}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Description & Details */}
                <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h3
                        className="text-sm font-semibold text-gray-900 pb-2"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        Job Description
                    </h3>

                    {/* Description HTML */}
                    {job.job_description && (
                        <div className="rounded-xl px-4 py-3" style={insetPanel}>
                            <div
                                className="text-sm text-gray-700 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-xl [&>h1]:font-bold [&>h2]:text-lg [&>h2]:font-bold [&>h3]:font-bold [&>p]:mb-2"
                                dangerouslySetInnerHTML={{ __html: job.job_description }}
                            />
                        </div>
                    )}

                    {/* Must Have Skills */}
                    {job.must_have_skills && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Must Have Skills</h4>
                            <div className="rounded-xl px-4 py-3" style={insetPanel}>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.must_have_skills}</p>
                            </div>
                        </div>
                    )}

                    {/* How to Apply */}
                    {job.apply_method && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">How to Apply</h4>
                            <div className="rounded-xl px-4 py-3 space-y-2" style={insetPanel}>
                                <div className="text-sm text-gray-700">
                                    <span className="text-xs text-gray-500">Method: </span>
                                    <span className="font-medium">{getLabelFromOptions(APPLY_METHODS, job.apply_method)}</span>
                                </div>
                                {job.apply_method === "external_link" && job.external_apply_link && (
                                    <a
                                        href={job.external_apply_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors group"
                                        style={{
                                            background: "#ffffff",
                                            boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)",
                                        }}
                                    >
                                        <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                                        <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                                            Application Link
                                        </span>
                                    </a>
                                )}
                                {job.apply_method === "email" && job.application_email && (
                                    <a
                                        href={`mailto:${job.application_email}`}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors group"
                                        style={{
                                            background: "#ffffff",
                                            boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)",
                                        }}
                                    >
                                        <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                                        <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                                            {job.application_email}
                                        </span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {tagsArray.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {tagsArray.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {job.status === "rejected" && job.rejection_reason && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                Rejection Reason
                            </h4>
                            <div
                                className="rounded-xl px-4 py-3"
                                style={{
                                    background: "rgba(239, 68, 68, 0.06)",
                                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.5)",
                                }}
                            >
                                <p className="text-sm text-red-700">{job.rejection_reason}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Applications Section ──────────────────────────── */}
            <div className="clay-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        Applications
                        <span className="text-xs font-normal text-gray-400">
                            ({appsTotalCount})
                        </span>
                    </h3>
                </div>

                {appsLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No applications received yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {applications.map((app) => (
                            <div key={app.id} className="rounded-xl p-4 transition-all hover:shadow-md" style={insetPanel}>
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Applicant name + status */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-gray-900">
                                                {app.applicant_name || app.applicant || "Unknown Applicant"}
                                            </h4>
                                            {app.status && (
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${app.status === "pending"
                                                        ? "bg-amber-100 text-amber-800"
                                                        : app.status === "approved"
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : app.status === "rejected"
                                                                ? "bg-red-100 text-red-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {app.status}
                                                </span>
                                            )}
                                        </div>

                                        {/* Email & date */}
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
                                            {app.applicant_email && (
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {app.applicant_email}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Applied on {formatDate(app.created_at)}
                                            </div>
                                        </div>

                                        {/* Detail grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700 mb-3">
                                            {app.years_of_experience && (
                                                <div><span className="text-gray-500">Experience:</span> {app.years_of_experience}</div>
                                            )}
                                            {app.current_position && (
                                                <div><span className="text-gray-500">Current Role:</span> {app.current_position}</div>
                                            )}
                                            {app.current_institution && (
                                                <div><span className="text-gray-500">Current Institution:</span> {app.current_institution}</div>
                                            )}
                                            {app.expected_salary && (
                                                <div><span className="text-gray-500">Expected Salary:</span> {app.expected_salary}</div>
                                            )}
                                            {app.notice_period && (
                                                <div><span className="text-gray-500">Notice Period:</span> {app.notice_period}</div>
                                            )}
                                        </div>

                                        {/* Additional information */}
                                        {app.additional_information && (
                                            <div
                                                className="text-sm text-gray-600 rounded-lg p-3 mb-3"
                                                style={{
                                                    background: "#ffffff",
                                                    boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.04)",
                                                }}
                                            >
                                                <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Additional Info</div>
                                                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: app.additional_information }} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Document links */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        {app.resume && (
                                            <a
                                                href={app.resume}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium !text-white rounded-xl transition-all hover:opacity-90"
                                                style={{
                                                    background: "#1f2937",
                                                    boxShadow: "2px 2px 6px rgba(0,0,0,0.08)",
                                                }}
                                            >
                                                <FileText className="w-4 h-4" />
                                                View Resume
                                            </a>
                                        )}
                                        {app.additional_document && (
                                            <a
                                                href={app.additional_document}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="clay-btn flex items-center justify-center gap-2 text-sm"
                                                style={{ padding: "8px 16px" }}
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Extra Doc
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {appsTotalPages > 1 && (
                    <div
                        className="flex items-center justify-between pt-3"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <button
                            onClick={() => setAppsPage((p) => Math.max(1, p - 1))}
                            disabled={appsPage === 1}
                            className="clay-btn disabled:opacity-50 flex items-center gap-1"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {appsPage} of {appsTotalPages}
                        </span>
                        <button
                            onClick={() => setAppsPage((p) => Math.min(appsTotalPages, p + 1))}
                            disabled={appsPage === appsTotalPages}
                            className="clay-btn disabled:opacity-50 flex items-center gap-1"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
            {/* ── Edit Modal ──────────────────────────────────── */}
            <AddEditJobModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateJob}
                job={job}
            />
        </div>
    );
}
