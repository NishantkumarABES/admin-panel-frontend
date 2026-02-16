import { useState, useEffect, useRef } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import type { JobPost, CreateJobDTO, WorkplaceType, EmploymentType, JobFunction, SeniorityLevel, ApplyMethod } from "../jobs.types";
import { WORKPLACE_TYPES, EMPLOYMENT_TYPES, JOB_FUNCTIONS, SENIORITY_LEVELS, APPLY_METHODS } from "../jobs.types";
import { SPECIALTIES } from "../../../Advertisements/advertisement.types";
import * as doctorService from "../../../../services/doctor.service";
import type { DoctorUser } from "../../../doctors/doctor.types";
import RichTextEditor from "../../../settings/components/RichTextEditor";

interface AddEditJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateJobDTO) => Promise<void>;
    job: JobPost | null;
}

const initialFormData: Omit<CreateJobDTO, "user_id"> = {
    title: "",
    company_name: "",
    workplace_type: "on_site" as WorkplaceType,
    employment_type: "full_time" as EmploymentType,
    job_location: "",
    job_function: "clinical" as JobFunction,
    speciality: "",
    seniority_level: "junior" as SeniorityLevel,
    experience: "",
    job_description: "",
    must_have_skills: "",
    salary_range: "",
    required_degrees: "",
    application_deadline: "",
    recruiter_name: "",
    apply_method: "platform" as ApplyMethod,
    external_apply_link: "",
    application_email: "",
    tags: "",
};

export default function AddEditJobModal({ isOpen, onClose, onSubmit, job }: AddEditJobModalProps) {
    const isEditMode = !!job;

    const [formData, setFormData] = useState(initialFormData);
    const [selectedUser, setSelectedUser] = useState<DoctorUser | null>(null);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [userResults, setUserResults] = useState<DoctorUser[]>([]);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [userSearchLoading, setUserSearchLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const userDropdownRef = useRef<HTMLDivElement>(null);

    // Search doctors with debounce
    useEffect(() => {
        if (!userSearchTerm.trim()) {
            setUserResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setUserSearchLoading(true);
                const response = await doctorService.getDoctors({
                    search: userSearchTerm,
                    page_size: 10,
                });
                setUserResults(response.data.results);
            } catch (error) {
                console.error("Failed to search doctors:", error);
            } finally {
                setUserSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [userSearchTerm]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        };

        if (isUserDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isUserDropdownOpen]);

    // Reset form when modal opens/closes or job changes
    useEffect(() => {
        if (isOpen) {
            if (job) {
                // Edit mode: pre-populate form with job data
                setFormData({
                    title: job.title,
                    company_name: job.company_name,
                    workplace_type: job.workplace_type,
                    employment_type: job.employment_type,
                    job_location: job.job_location,
                    job_function: job.job_function,
                    speciality: job.speciality || "",
                    seniority_level: job.seniority_level,
                    experience: job.experience || "",
                    job_description: job.job_description,
                    must_have_skills: job.must_have_skills,
                    salary_range: job.salary_range || "",
                    required_degrees: job.required_degrees,
                    application_deadline: job.application_deadline || "",
                    recruiter_name: job.recruiter_name,
                    apply_method: job.apply_method,
                    external_apply_link: job.external_apply_link || "",
                    application_email: job.application_email || "",
                    tags: job.tags || "",
                });
                setSelectedUser(null);
                setUserSearchTerm("");
            } else {
                // Add mode: reset form
                setFormData(initialFormData);
                setSelectedUser(null);
                setUserSearchTerm("");
            }
            setErrors({});
        }
    }, [isOpen, job]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!isEditMode && !selectedUser) newErrors.user_id = "Please select a doctor user";
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.company_name.trim()) newErrors.company_name = "Company name is required";
        if (!formData.job_location.trim()) newErrors.job_location = "Location is required";
        if (!formData.speciality) newErrors.speciality = "Specialty is required";
        if (!formData.required_degrees.trim()) newErrors.required_degrees = "Required degrees is required";
        if (!formData.must_have_skills.trim()) newErrors.must_have_skills = "Skills are required";

        if (formData.apply_method === "external_link" && !formData.external_apply_link) {
            newErrors.external_apply_link = "External link is required";
        }
        if (formData.apply_method === "email" && !formData.application_email) {
            newErrors.application_email = "Email is required";
        } else if (formData.apply_method === "email" && formData.application_email && !/\S+@\S+\.\S+/.test(formData.application_email)) {
            newErrors.application_email = "Invalid email format";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (!isEditMode && !selectedUser) return;

        try {
            setIsSubmitting(true);
            await onSubmit({
                ...formData,
                user_id: isEditMode ? (job!.id) : selectedUser!.id,
                // Ensure empty strings are treated as empty for optional fields if needed, or pass as is
            });
            onClose();
        } catch (error) {
            console.error(`Failed to ${isEditMode ? "update" : "create"} job:`, error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {isEditMode ? "Edit Job Post" : "Create Job Post"}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Section: Basic Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Basic Information</h4>

                            {/* Doctor User Search - only shown in add mode */}
                            {!isEditMode && (
                                <div ref={userDropdownRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Doctor User <span className="text-red-500">*</span>
                                    </label>
                                    {selectedUser ? (
                                        <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">{selectedUser.full_name}</div>
                                                <div className="text-xs text-gray-500">{selectedUser.email}</div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(null);
                                                    setUserSearchTerm("");
                                                }}
                                                className="p-1 rounded text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                                className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between gap-2 bg-white ${errors.user_id ? "border-red-300" : "border-gray-300"
                                                    }`}
                                            >
                                                <span className="text-gray-400 text-sm">Search and select a doctor...</span>
                                                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                            </button>

                                            {isUserDropdownOpen && (
                                                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                                                    <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                                                        <div className="relative">
                                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                value={userSearchTerm}
                                                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                                                placeholder="Search by name or email..."
                                                                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="overflow-y-auto max-h-48">
                                                        {userSearchLoading ? (
                                                            <div className="px-3 py-3 text-sm text-gray-500 text-center">Searching...</div>
                                                        ) : userResults.length > 0 ? (
                                                            userResults.map((doctor) => (
                                                                <button
                                                                    key={doctor.id}
                                                                    onClick={() => {
                                                                        setSelectedUser(doctor);
                                                                        setIsUserDropdownOpen(false);
                                                                        setUserSearchTerm("");
                                                                    }}
                                                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-50 last:border-0"
                                                                >
                                                                    <div className="font-medium text-gray-900 text-sm">{doctor.full_name}</div>
                                                                    <div className="text-xs text-gray-500">{doctor.email} · {doctor.doctor_profile?.specialization || "—"}</div>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-3 py-3 text-sm text-gray-500 text-center">Type to search doctors</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {errors.user_id && <p className="text-xs text-red-500 mt-1">{errors.user_id}</p>}
                                </div>
                            )}

                            {/* Uploaded By (read-only, edit mode only) */}
                            {isEditMode && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Posted By
                                    </label>
                                    <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
                                        {job!.created_by_name || job!.created_by}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Job Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.title ? "border-red-300" : "border-gray-300"}`}
                                        placeholder="e.g. Senior Cardiologist"
                                    />
                                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.company_name ? "border-red-300" : "border-gray-300"}`}
                                        placeholder="e.g. City Hospital"
                                    />
                                    {errors.company_name && <p className="text-xs text-red-500 mt-1">{errors.company_name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Workplace Type
                                    </label>
                                    <select
                                        value={formData.workplace_type}
                                        onChange={(e) => setFormData({ ...formData, workplace_type: e.target.value as WorkplaceType })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    >
                                        {WORKPLACE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Employment Type
                                    </label>
                                    <select
                                        value={formData.employment_type}
                                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as EmploymentType })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    >
                                        {EMPLOYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.job_location}
                                        onChange={(e) => setFormData({ ...formData, job_location: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.job_location ? "border-red-300" : "border-gray-300"}`}
                                        placeholder="e.g. New York, NY"
                                    />
                                    {errors.job_location && <p className="text-xs text-red-500 mt-1">{errors.job_location}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Job Details */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Job Details</h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Job Function
                                    </label>
                                    <select
                                        value={formData.job_function}
                                        onChange={(e) => setFormData({ ...formData, job_function: e.target.value as JobFunction })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    >
                                        {JOB_FUNCTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Specialty <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.speciality}
                                        onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.speciality ? "border-red-300" : "border-gray-300"}`}
                                    >
                                        <option value="">Select Specialty</option>
                                        {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    {errors.speciality && <p className="text-xs text-red-500 mt-1">{errors.speciality}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Seniority Level
                                    </label>
                                    <select
                                        value={formData.seniority_level}
                                        onChange={(e) => setFormData({ ...formData, seniority_level: e.target.value as SeniorityLevel })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    >
                                        {SENIORITY_LEVELS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                                    <input
                                        type="text"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        placeholder="e.g. 5+ years"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Degrees <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.required_degrees}
                                        onChange={(e) => setFormData({ ...formData, required_degrees: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.required_degrees ? "border-red-300" : "border-gray-300"}`}
                                        placeholder="e.g. MD, MBBS"
                                    />
                                    {errors.required_degrees && <p className="text-xs text-red-500 mt-1">{errors.required_degrees}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                                <input
                                    type="text"
                                    value={formData.salary_range}
                                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    placeholder="e.g. $100k - $150k"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Must Have Skills <span className="text-red-500">*</span></label>
                                <textarea
                                    value={formData.must_have_skills}
                                    onChange={(e) => setFormData({ ...formData, must_have_skills: e.target.value })}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none ${errors.must_have_skills ? "border-red-300" : "border-gray-300"}`}
                                    placeholder="List required skills..."
                                />
                                {errors.must_have_skills && <p className="text-xs text-red-500 mt-1">{errors.must_have_skills}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                                <RichTextEditor
                                    content={formData.job_description}
                                    onChange={(html) => setFormData({ ...formData, job_description: html })}
                                    editable={true}
                                />
                            </div>
                        </div>

                        {/* Section: Application Details */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 border-b pb-2">Application Details</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                                    <input
                                        type="date"
                                        value={formData.application_deadline}
                                        onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Recruiter Name</label>
                                    <input
                                        type="text"
                                        value={formData.recruiter_name}
                                        onChange={(e) => setFormData({ ...formData, recruiter_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        placeholder="Name of recruiter"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Apply Method</label>
                                    <select
                                        value={formData.apply_method}
                                        onChange={(e) => setFormData({ ...formData, apply_method: e.target.value as ApplyMethod })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    >
                                        {APPLY_METHODS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    {formData.apply_method === "external_link" && (
                                        <>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">External Link <span className="text-red-500">*</span></label>
                                            <input
                                                type="url"
                                                value={formData.external_apply_link}
                                                onChange={(e) => setFormData({ ...formData, external_apply_link: e.target.value })}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.external_apply_link ? "border-red-300" : "border-gray-300"}`}
                                                placeholder="https://..."
                                            />
                                            {errors.external_apply_link && <p className="text-xs text-red-500 mt-1">{errors.external_apply_link}</p>}
                                        </>
                                    )}
                                    {formData.apply_method === "email" && (
                                        <>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Application Email <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                value={formData.application_email}
                                                onChange={(e) => setFormData({ ...formData, application_email: e.target.value })}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.application_email ? "border-red-300" : "border-gray-300"}`}
                                                placeholder="jobs@company.com"
                                            />
                                            {errors.application_email && <p className="text-xs text-red-500 mt-1">{errors.application_email}</p>}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    placeholder="Comma separated tags e.g. remote, urgent"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting
                                ? (isEditMode ? "Updating..." : "Creating...")
                                : (isEditMode ? "Update Job" : "Create Job")
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
