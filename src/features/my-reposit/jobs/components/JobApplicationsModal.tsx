import { useState, useEffect } from "react";
import { X, ExternalLink, Calendar, Mail, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import type { JobPost, JobApplication } from "../jobs.types";
import * as jobService from "../../../../services/job.service";
import toast from "react-hot-toast";

interface JobApplicationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: JobPost | null;
}

export default function JobApplicationsModal({ isOpen, onClose, job }: JobApplicationsModalProps) {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalApplications, setTotalApplications] = useState(0);

    const fetchApplications = async () => {
        if (!job) return;
        try {
            setLoading(true);
            const response = await jobService.getJobApplications(job.id, currentPage);
            setApplications(response.results);
            setTotalApplications(response.count);
            setTotalPages(Math.ceil(response.count / 10));
        } catch (error) {
            console.error("Failed to fetch applications:", error);
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && job) { setCurrentPage(1); fetchApplications(); }
        else { setApplications([]); }
    }, [isOpen, job]);

    useEffect(() => {
        if (isOpen && job) { fetchApplications(); }
    }, [currentPage]);

    if (!isOpen || !job) return null;

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    const insetStyle = {
        background: "#f8f9fb",
        boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.6)",
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-[18px] w-full max-w-4xl max-h-[90vh] flex flex-col"
                    style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.08)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Applications for "{job.title}"</h2>
                            <div className="text-sm text-gray-500 mt-0.5">{totalApplications} application{totalApplications !== 1 ? "s" : ""} received</div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-all active:scale-95" style={{ background: "#f8f9fb", boxShadow: "2px 2px 4px rgba(0,0,0,0.06), -2px -2px 4px rgba(255,255,255,0.6)" }}>
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p>No applications received yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applications.map((app) => (
                                    <div key={app.id} className="rounded-xl p-4 transition-all hover:shadow-md" style={insetStyle}>
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-gray-900">
                                                        {app.applicant || app.applicant_name || "Unknown Applicant"}
                                                    </h4>
                                                    {app.status && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${app.status === 'pending' ? 'bg-amber-100 text-amber-800' : app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {app.status}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
                                                    {app.applicant_email && (
                                                        <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{app.applicant_email}</div>
                                                    )}
                                                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Applied on {formatDate(app.created_at)}</div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700 mb-3">
                                                    {app.years_of_experience && <div><span className="text-gray-500">Experience:</span> {app.years_of_experience}</div>}
                                                    {app.current_position && <div><span className="text-gray-500">Current Role:</span> {app.current_position}</div>}
                                                    {app.current_institution && <div><span className="text-gray-500">Current Institution:</span> {app.current_institution}</div>}
                                                    {app.expected_salary && <div><span className="text-gray-500">Expected Salary:</span> {app.expected_salary}</div>}
                                                    {app.notice_period && <div><span className="text-gray-500">Notice Period:</span> {app.notice_period}</div>}
                                                </div>

                                                {app.additional_information && (
                                                    <div className="text-sm text-gray-600 rounded-lg p-3 mb-3" style={{ background: "#ffffff", boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.04)" }}>
                                                        <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Additional Info</div>
                                                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: app.additional_information }} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 shrink-0">
                                                {app.resume && (
                                                    <a href={app.resume} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90"
                                                        style={{ background: "#1f2937", boxShadow: "2px 2px 6px rgba(0,0,0,0.08)" }}>
                                                        <FileText className="w-4 h-4" /> View Resume
                                                    </a>
                                                )}
                                                {app.additional_document && (
                                                    <a href={app.additional_document} target="_blank" rel="noopener noreferrer"
                                                        className="clay-btn flex items-center justify-center gap-2 text-sm"
                                                        style={{ padding: "8px 16px" }}>
                                                        <ExternalLink className="w-4 h-4" /> Extra Doc
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-3 shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="clay-btn disabled:opacity-50" style={{ padding: "6px 12px" }}>
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                className="clay-btn disabled:opacity-50" style={{ padding: "6px 12px" }}>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
