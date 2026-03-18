import { Briefcase, ExternalLink, Mail } from "lucide-react";
import type { JobPost, JobPostStatus } from "../jobs.types";
import { EMPLOYMENT_TYPES, WORKPLACE_TYPES, JOB_FUNCTIONS, SENIORITY_LEVELS, APPLY_METHODS } from "../jobs.types";

interface JobDetailsModalProps {
    job: JobPost | null;
    isOpen: boolean;
    onClose: () => void;
}

function getStatusBadge(status: JobPostStatus | undefined | null) {
    if (!status) return null;
    const styles: Record<JobPostStatus, string> = {
        draft: "bg-gray-100 text-gray-800",
        in_review: "bg-blue-100 text-blue-800",
        published: "bg-emerald-100 text-emerald-800",
        rejected: "bg-red-100 text-red-800",
        expired: "bg-purple-100 text-purple-800",
        closed: "bg-gray-100 text-gray-600",
    };
    const labels: Record<JobPostStatus, string> = {
        draft: "Draft",
        in_review: "In Review",
        published: "Published",
        rejected: "Rejected",
        expired: "Expired",
        closed: "Closed",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-800"}`}>
            {labels[status] || status}
        </span>
    );
}

function getLabelFromOptions<T extends string>(options: { value: T; label: string }[], value: T | undefined | null): string {
    if (!value) return "—";
    return options.find((opt) => opt.value === value)?.label || String(value).replace(/_/g, " ");
}

export default function JobDetailsModal({ job, isOpen, onClose }: JobDetailsModalProps) {
    if (!isOpen || !job) return null;

    const InfoItem = ({
        icon: Icon, label, value,
    }: {
        icon: React.ElementType;
        label: string;
        value: string | number | undefined | null | React.ReactNode;
    }) => {
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
    };

    const tagsArray = job.tags ? String(job.tags).split(",").filter((t) => t.trim()) : [];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

            {/* Modal container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-[18px] w-full max-w-2xl max-h-[90vh] flex flex-col"
                    style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sticky Header */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">
                        {/* Header: icon + job title + status */}
                        <div className="flex items-start justify-between gap-4 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)"
                                    }}
                                >
                                    <Briefcase className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                    <p className="text-xs text-gray-500">{job.company_name} · {job.job_location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                                {getStatusBadge(job.status)}
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                    {getLabelFromOptions(EMPLOYMENT_TYPES, job.employment_type)}
                                </span>
                                {job.is_deleted && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Deleted
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Job Information — Inset Panel */}
                        <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Job Information</h4>
                            <div
                                className="grid grid-cols-2 gap-x-6 gap-y-3 py-4 px-3 rounded-xl"
                                style={{
                                    background: "#f8f9fb",
                                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                }}
                            >
                                <InfoItem icon={Briefcase} label="Posted By" value={job.created_by_name || job.created_by} />
                                <InfoItem icon={Briefcase} label="Company" value={job.company_name} />
                                <InfoItem icon={Briefcase} label="Location" value={job.job_location} />
                                <InfoItem icon={Briefcase} label="Workplace Type" value={getLabelFromOptions(WORKPLACE_TYPES, job.workplace_type)} />
                                <InfoItem icon={Briefcase} label="Employment Type" value={getLabelFromOptions(EMPLOYMENT_TYPES, job.employment_type)} />
                                <InfoItem icon={Briefcase} label="Job Function" value={getLabelFromOptions(JOB_FUNCTIONS, job.job_function)} />
                                <InfoItem icon={Briefcase} label="Seniority Level" value={getLabelFromOptions(SENIORITY_LEVELS, job.seniority_level)} />
                                <InfoItem icon={Briefcase} label="Specialty" value={job.speciality} />
                                <InfoItem icon={Briefcase} label="Experience" value={job.experience} />
                                <InfoItem icon={Briefcase} label="Salary Range" value={job.salary_range} />
                                <InfoItem icon={Briefcase} label="Required Degrees" value={job.required_degrees} />
                                <InfoItem icon={Briefcase} label="Recruiter" value={job.recruiter_name} />
                            </div>
                        </div>

                        {/* Application Deadline */}
                        {job.application_deadline && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Application Deadline</h4>
                                <div
                                    className="rounded-xl p-3"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
                                >
                                    <p className="text-sm text-gray-700">
                                        {new Date(job.application_deadline).toLocaleDateString("en-IN", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Statistics */}
                        <div className="mt-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Statistics</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    className="rounded-xl p-3 text-center"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
                                >
                                    <div className="text-base font-bold text-gray-900">{job.views ?? 0}</div>
                                    <div className="text-xs text-gray-500">Views</div>
                                </div>
                                <div
                                    className="rounded-xl p-3 text-center"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
                                >
                                    <div className="text-base font-bold text-gray-900">{job.applications_count ?? 0}</div>
                                    <div className="text-xs text-gray-500">Applications</div>
                                </div>
                            </div>
                        </div>

                        {/* Job Description */}
                        {job.job_description && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Job Description</h4>
                                <div
                                    className="rounded-xl p-3"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
                                >
                                    <div
                                        className="text-sm text-gray-700 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-xl [&>h1]:font-bold [&>h2]:text-lg [&>h2]:font-bold [&>h3]:font-bold [&>p]:mb-2"
                                        dangerouslySetInnerHTML={{ __html: job.job_description }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Must Have Skills */}
                        {job.must_have_skills && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Must Have Skills</h4>
                                <div
                                    className="rounded-xl p-3"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
                                >
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.must_have_skills}</p>
                                </div>
                            </div>
                        )}

                        {/* How to Apply */}
                        {job.apply_method && (
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">How to Apply</h4>
                                <div
                                    className="rounded-xl p-3 space-y-2"
                                    style={{
                                        background: "#f8f9fb",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
                                    }}
                                >
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
                                                boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)"
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
                                                boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)"
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
                            <div className="mt-3">
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
                            <div className="mt-3">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Rejection Reason</h4>
                                <div
                                    className="rounded-xl p-3"
                                    style={{
                                        background: "rgba(239, 68, 68, 0.06)",
                                        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.5)"
                                    }}
                                >
                                    <p className="text-sm text-red-700">{job.rejection_reason}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sticky Footer */}
                    <div
                        className="flex items-center justify-between px-6 py-4 shrink-0"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <div className="text-xs text-gray-500">
                            {job.created_at && <span>Created: {new Date(job.created_at).toLocaleString("en-IN")} · </span>}
                            Job ID: {job.id}
                        </div>
                        <button
                            onClick={onClose}
                            className="clay-btn"
                            style={{ fontSize: "13px", padding: "6px 16px" }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
