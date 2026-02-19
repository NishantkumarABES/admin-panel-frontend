import { Briefcase, ExternalLink, XCircle, Mail } from "lucide-react";
import type { JobPost, JobPostStatus } from "../jobs.types";
import { EMPLOYMENT_TYPES, WORKPLACE_TYPES, JOB_FUNCTIONS, SENIORITY_LEVELS, APPLY_METHODS } from "../jobs.types";

interface JobDetailsModalProps {
    job: JobPost | null;
    isOpen: boolean;
    onClose: () => void;
}

const Modal = ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black/50"></div>

                <div
                    className="relative inline-block w-full max-w-2xl p-5 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto pr-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

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
    if (!job) return null;

    const InfoCell = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
        <div>
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-sm font-medium text-gray-900">{value || "—"}</div>
        </div>
    );

    const tagsArray = job.tags ? String(job.tags).split(",").filter((t) => t.trim()) : [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Job Details">
            <div className="space-y-4">
                {/* Header with Job Info */}
                <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
                        <Briefcase className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900">
                            {job.title}
                        </h3>
                        <p className="text-sm text-gray-600">{job.company_name} · {job.job_location}</p>
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

                {/* Job Information */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Job Information
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-gray-50 rounded-lg p-3">
                        <InfoCell label="Posted By" value={job.created_by_name || job.created_by} />
                        <InfoCell label="Company" value={job.company_name} />
                        <InfoCell label="Location" value={job.job_location} />
                        <InfoCell label="Workplace Type" value={getLabelFromOptions(WORKPLACE_TYPES, job.workplace_type)} />
                        <InfoCell label="Employment Type" value={getLabelFromOptions(EMPLOYMENT_TYPES, job.employment_type)} />
                        <InfoCell label="Job Function" value={getLabelFromOptions(JOB_FUNCTIONS, job.job_function)} />
                        <InfoCell label="Seniority Level" value={getLabelFromOptions(SENIORITY_LEVELS, job.seniority_level)} />
                        <InfoCell label="Specialty" value={job.speciality} />
                        <InfoCell label="Experience" value={job.experience} />
                        <InfoCell label="Salary Range" value={job.salary_range} />
                        <InfoCell label="Required Degrees" value={job.required_degrees} />
                        <InfoCell label="Recruiter" value={job.recruiter_name} />
                    </div>
                </div>

                {/* Application Deadline */}
                {job.application_deadline && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Application Deadline
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3">
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
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-base font-bold text-gray-900">{job.views ?? 0}</div>
                            <div className="text-xs text-gray-500">Views</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-base font-bold text-gray-900">{job.applications_count ?? 0}</div>
                            <div className="text-xs text-gray-500">Applications</div>
                        </div>
                    </div>
                </div>

                {/* Job Description */}
                {job.job_description && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Job Description
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div
                                className="text-sm text-gray-700 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-xl [&>h1]:font-bold [&>h2]:text-lg [&>h2]:font-bold [&>h3]:font-bold [&>p]:mb-2"
                                dangerouslySetInnerHTML={{ __html: job.job_description }}
                            />
                        </div>
                    </div>
                )}

                {/* Must Have Skills */}
                {job.must_have_skills && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Must Have Skills
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.must_have_skills}</p>
                        </div>
                    </div>
                )}

                {/* How to Apply */}
                {job.apply_method && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            How to Apply
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="text-sm text-gray-700">
                                <span className="text-xs text-gray-500">Method: </span>
                                <span className="font-medium">{getLabelFromOptions(APPLY_METHODS, job.apply_method)}</span>
                            </div>
                            {job.apply_method === "external_link" && job.external_apply_link && (
                                <a
                                    href={job.external_apply_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors group"
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
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors group"
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
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Tags
                        </h4>
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
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Rejection Reason
                        </h4>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                            <p className="text-sm text-red-700">{job.rejection_reason}</p>
                        </div>
                    </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-400 pt-3 border-t border-gray-200">
                    {job.created_at && <p>Created: {new Date(job.created_at).toLocaleString("en-IN")}</p>}
                    {job.updated_at && <p>Updated: {new Date(job.updated_at).toLocaleString("en-IN")}</p>}
                    <p>Job ID: {job.id}</p>
                </div>
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
}
