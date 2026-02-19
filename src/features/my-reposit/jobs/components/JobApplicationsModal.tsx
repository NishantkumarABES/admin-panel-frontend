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
            // Assuming default page size of 10 or whatever the backend returns, calculating total pages roughly
            // Ideally backend returns total pages or next/prev links which the service handles
            // Here we rely on count and assume page size 10 for simplicity or standard pagination
            setTotalPages(Math.ceil(response.count / 10));
        } catch (error) {
            console.error("Failed to fetch applications:", error);
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && job) {
            setCurrentPage(1);
            fetchApplications();
        } else {
            setApplications([]);
        }
    }, [isOpen, job]);

    useEffect(() => {
        if (isOpen && job) {
            fetchApplications();
        }
    }, [currentPage]);

    if (!isOpen || !job) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 transition-opacity" />
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Applications for "{job.title}"
                            </h3>
                            <div className="text-sm text-gray-500 mt-1">
                                {totalApplications} application{totalApplications !== 1 ? "s" : ""} received
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p>No applications received yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applications.map((app) => (
                                    <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-gray-900">
                                                        {app.applicant || app.applicant_name || "Unknown Applicant"}
                                                    </h4>
                                                    {app.status && (
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize 
                                                            ${app.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                                app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                                                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-800'}`}>
                                                            {app.status}
                                                        </span>
                                                    )}
                                                </div>

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

                                                {app.additional_information && (
                                                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mb-3">
                                                        <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Additional Info</div>
                                                        <div
                                                            className="prose prose-sm max-w-none"
                                                            dangerouslySetInnerHTML={{ __html: app.additional_information }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 shrink-0">
                                                {app.resume && (
                                                    <a
                                                        href={app.resume}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium !text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
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
                                                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
