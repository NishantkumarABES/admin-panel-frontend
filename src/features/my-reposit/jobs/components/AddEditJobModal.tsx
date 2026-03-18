import { useState, useEffect, useRef } from "react";
import { X, Search, ChevronDown, AlertCircle } from "lucide-react";
import type { JobPost, CreateJobDTO, WorkplaceType, EmploymentType, JobFunction, SeniorityLevel, ApplyMethod } from "../jobs.types";
import { WORKPLACE_TYPES, EMPLOYMENT_TYPES, JOB_FUNCTIONS, SENIORITY_LEVELS, APPLY_METHODS } from "../jobs.types";
import { SPECIALTIES } from "../../../Advertisements/advertisement.types";
import * as doctorService from "../../../../services/doctor.service";
import type { DoctorUser } from "../../../doctors/doctor.types";
import RichTextEditor from "../../../settings/components/RichTextEditor";
import Modal from "../../../../components/common/Modal";

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

    // Add scrollbar styles
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    // Search doctors with debounce
    useEffect(() => {
        if (!userSearchTerm.trim()) { setUserResults([]); return; }
        const timer = setTimeout(async () => {
            try {
                setUserSearchLoading(true);
                const response = await doctorService.getDoctors({ search: userSearchTerm, page_size: 10 });
                setUserResults(response.data.results);
            } catch (error) { console.error("Failed to search doctors:", error); }
            finally { setUserSearchLoading(false); }
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
                setFormData({
                    title: job.title || "", company_name: job.company_name || "",
                    workplace_type: job.workplace_type, employment_type: job.employment_type,
                    job_location: job.job_location || "", job_function: job.job_function,
                    speciality: job.speciality || "", seniority_level: job.seniority_level,
                    experience: job.experience || "", job_description: job.job_description || "",
                    must_have_skills: job.must_have_skills || "", salary_range: job.salary_range || "",
                    required_degrees: job.required_degrees || "", application_deadline: job.application_deadline || "",
                    recruiter_name: job.recruiter_name || "", apply_method: job.apply_method,
                    external_apply_link: job.external_apply_link || "", application_email: job.application_email || "",
                    tags: job.tags || "",
                });
                setSelectedUser(null); setUserSearchTerm("");
            } else {
                setFormData(initialFormData); setSelectedUser(null); setUserSearchTerm("");
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
        if (formData.required_degrees.length > 50) newErrors.required_degrees = "Required degrees cannot exceed 50 characters";
        if (!formData.must_have_skills.trim()) newErrors.must_have_skills = "Skills are required";
        if (formData.must_have_skills.length > 500) newErrors.must_have_skills = "Must have skills cannot exceed 500 characters";
        if (!formData.application_deadline) newErrors.application_deadline = "Application deadline is required";
        if ((formData.recruiter_name ?? '').length > 50) newErrors.recruiter_name = "Recruiter name cannot exceed 50 characters";
        if (formData.apply_method === "external_link" && !formData.external_apply_link) newErrors.external_apply_link = "External link is required";
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
            await onSubmit({ ...formData, user_id: isEditMode ? (job!.created_by) : selectedUser!.id });
            onClose();
        } catch (error) { console.error(`Failed to ${isEditMode ? "update" : "create"} job:`, error); }
        finally { setIsSubmitting(false); }
    };

    if (!isOpen) return null;

    const inputStyle = (hasError?: boolean) => ({
        background: "#ffffff",
        border: hasError ? "1px solid #ef4444" : "1px solid #e5e7eb",
        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
    });

    const sectionStyle = {
        background: "#f8f9fb",
        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? "Edit Job Post" : "Create Job Post"}
        >
            <div className="flex flex-col h-full">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 z-10 active:scale-95 active:shadow-inner"
                    style={{ background: "#f8f9fb", boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.6)" }}
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar" style={{ maxHeight: 'calc(80vh - 140px)', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>

                        {/* Basic Info Section */}
                        <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                Basic Information
                            </h3>

                            {/* Doctor User Search - only shown in add mode */}
                            {!isEditMode && (
                                <div ref={userDropdownRef} className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Doctor User *</label>
                                    {selectedUser ? (
                                        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ ...inputStyle(), background: "#f8f9fb" }}>
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">{selectedUser.full_name}</div>
                                                <div className="text-xs text-gray-500">{selectedUser.email}</div>
                                            </div>
                                            <button onClick={() => { setSelectedUser(null); setUserSearchTerm(""); }} className="p-1 rounded text-gray-400 hover:text-gray-600">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                                className="w-full px-4 py-2.5 text-sm rounded-xl cursor-pointer transition-all text-left flex items-center justify-between"
                                                style={inputStyle(!!errors.user_id)}
                                            >
                                                <span className="text-gray-400">Search and select a doctor...</span>
                                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`} />
                                            </button>
                                            {isUserDropdownOpen && (
                                                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}>
                                                    <div className="p-3 border-b border-gray-100">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <input type="text" className="w-full pl-10 pr-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" style={{ background: "#f8f9fb", border: "1px solid #e5e7eb" }} placeholder="Search by name or email..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-44 overflow-y-auto">
                                                        {userSearchLoading ? (
                                                            <div className="px-4 py-3 text-sm text-gray-500 text-center">Searching...</div>
                                                        ) : userResults.length > 0 ? (
                                                            userResults.map((doctor) => (
                                                                <div key={doctor.id} className="px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-gray-50 text-gray-700" onClick={() => { setSelectedUser(doctor); setIsUserDropdownOpen(false); setUserSearchTerm(""); }}>
                                                                    <div className="font-medium text-gray-900">{doctor.full_name}</div>
                                                                    <div className="text-xs text-gray-500">{doctor.email} · {doctor.doctor_profile?.specialization || "—"}</div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-8 text-sm text-gray-400 text-center">Type to search doctors</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {errors.user_id && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.user_id}</p>}
                                </div>
                            )}

                            {/* Uploaded By (read-only, edit mode only) */}
                            {isEditMode && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Posted By</label>
                                    <div className="px-4 py-2.5 text-sm rounded-xl text-gray-700" style={{ ...inputStyle(), background: "#f8f9fb" }}>
                                        {job!.created_by_name || job!.created_by}
                                    </div>
                                </div>
                            )}

                            {/* Job Title & Company Name */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                                    <input type="text" maxLength={50} value={formData.title} onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (e.target.value.length >= 50) { setErrors(prev => ({ ...prev, title: 'Job title cannot exceed 50 characters' })); } else { setErrors(prev => { const { title, ...rest } = prev; return rest; }); } }} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.title)} placeholder="e.g. Senior Cardiologist" />
                                    {errors.title && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                                    <input type="text" maxLength={50} value={formData.company_name} onChange={(e) => { setFormData({ ...formData, company_name: e.target.value }); if (e.target.value.length >= 50) { setErrors(prev => ({ ...prev, company_name: 'Company name cannot exceed 50 characters' })); } else { setErrors(prev => { const { company_name, ...rest } = prev; return rest; }); } }} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.company_name)} placeholder="e.g. City Hospital" />
                                    {errors.company_name && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.company_name}</p>}
                                </div>
                            </div>

                            {/* Workplace, Employment, Location */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Workplace Type</label>
                                    <select value={formData.workplace_type} onChange={(e) => setFormData({ ...formData, workplace_type: e.target.value as WorkplaceType })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle()}>
                                        {WORKPLACE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                                    <select value={formData.employment_type} onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as EmploymentType })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle()}>
                                        {EMPLOYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                                    <input type="text" value={formData.job_location} onChange={(e) => setFormData({ ...formData, job_location: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.job_location)} placeholder="e.g. New York, NY" />
                                    {errors.job_location && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.job_location}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Job Details Section */}
                        <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                Job Details
                            </h3>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Function</label>
                                    <select value={formData.job_function} onChange={(e) => setFormData({ ...formData, job_function: e.target.value as JobFunction })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle()}>
                                        {JOB_FUNCTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty *</label>
                                    <select value={formData.speciality} onChange={(e) => setFormData({ ...formData, speciality: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.speciality)}>
                                        <option value="">Select Specialty</option>
                                        {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    {errors.speciality && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.speciality}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Seniority Level</label>
                                    <select value={formData.seniority_level} onChange={(e) => setFormData({ ...formData, seniority_level: e.target.value as SeniorityLevel })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle()}>
                                        {SENIORITY_LEVELS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={formData.experience}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '' || (/^\d+$/.test(val) && val.length <= 2)) {
                                                    setFormData({ ...formData, experience: val });
                                                }
                                            }}
                                            className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all pr-16"
                                            style={inputStyle()}
                                            placeholder="e.g. 5"
                                        />

                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                                            {parseInt(formData.experience ?? '') === 1 ? 'year' : 'years'}
                                        </span>

                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Required Degrees *</label>
                                    <input
                                        type="text"
                                        maxLength={50}
                                        value={formData.required_degrees}
                                        onChange={(e) => {
                                            setFormData({ ...formData, required_degrees: e.target.value });
                                            if (e.target.value.length >= 50) {
                                                setErrors(prev => ({ ...prev, required_degrees: 'Required degrees cannot exceed 50 characters' }));
                                            } else {
                                                setErrors(prev => { const { required_degrees, ...rest } = prev; return rest; });
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                        style={inputStyle(!!errors.required_degrees)}
                                        placeholder="e.g. MD, MBBS"
                                    />
                                    {errors.required_degrees && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.required_degrees}</p>}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                                <input type="text" value={formData.salary_range} onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle()} placeholder="e.g. $100k - $150k" />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Must Have Skills *</label>
                                <textarea
                                    value={formData.must_have_skills}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 500) {
                                            setFormData({ ...formData, must_have_skills: e.target.value });
                                            if (errors.must_have_skills && e.target.value.trim()) {
                                                setErrors(prev => { const { must_have_skills, ...rest } = prev; return rest; });
                                            }
                                        }
                                    }}
                                    rows={3}
                                    className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all resize-none"
                                    style={inputStyle(!!errors.must_have_skills)}
                                    placeholder="List required skills..."
                                    maxLength={500}
                                />
                                <div className="flex items-center justify-between mt-1">
                                    <div>
                                        {errors.must_have_skills && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.must_have_skills}</p>}
                                    </div>
                                    <span className={`text-xs ${formData.must_have_skills.length >= 500 ? 'text-red-500' : formData.must_have_skills.length >= 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                                        {formData.must_have_skills.length}/500
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                                <RichTextEditor content={formData.job_description} onChange={(html) => setFormData({ ...formData, job_description: html })} editable={true} />
                            </div>
                        </div>

                        {/* Application Details Section */}
                        <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                Application Details
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline *</label>
                                    <input
                                        type="date"
                                        value={formData.application_deadline}
                                        onChange={(e) => {
                                            setFormData({ ...formData, application_deadline: e.target.value });
                                            if (e.target.value) {
                                                setErrors(prev => { const { application_deadline, ...rest } = prev; return rest; });
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                        style={inputStyle(!!errors.application_deadline)}
                                    />
                                    {errors.application_deadline && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.application_deadline}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Recruiter Name</label>
                                    <input
                                        type="text"
                                        maxLength={50}
                                        value={formData.recruiter_name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, recruiter_name: e.target.value });
                                            if (e.target.value.length >= 50) {
                                                setErrors(prev => ({ ...prev, recruiter_name: 'Recruiter name cannot exceed 50 characters' }));
                                            } else {
                                                setErrors(prev => { const { recruiter_name, ...rest } = prev; return rest; });
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                        style={inputStyle(!!errors.recruiter_name)}
                                        placeholder="Name of recruiter"
                                    />
                                    {errors.recruiter_name && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.recruiter_name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Apply Method</label>
                                    <select value={formData.apply_method} onChange={(e) => setFormData({ ...formData, apply_method: e.target.value as ApplyMethod })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle()}>
                                        {APPLY_METHODS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    {formData.apply_method === "external_link" && (
                                        <>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">External Link *</label>
                                            <input type="url" value={formData.external_apply_link} onChange={(e) => setFormData({ ...formData, external_apply_link: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.external_apply_link)} placeholder="https://..." />
                                            {errors.external_apply_link && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.external_apply_link}</p>}
                                        </>
                                    )}
                                    {formData.apply_method === "email" && (
                                        <>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Application Email *</label>
                                            <input type="email" value={formData.application_email} onChange={(e) => setFormData({ ...formData, application_email: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.application_email)} placeholder="jobs@company.com" />
                                            {errors.application_email && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.application_email}</p>}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                <input
                                    type="text"
                                    maxLength={100}
                                    value={formData.tags}
                                    onChange={(e) => {
                                        setFormData({ ...formData, tags: e.target.value });
                                        if (e.target.value.length >= 100) {
                                            setErrors(prev => ({ ...prev, tags: 'Tags cannot exceed 100 characters' }));
                                        } else {
                                            setErrors(prev => { const { tags, ...rest } = prev; return rest; });
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                    style={inputStyle(!!errors.tags)}
                                    placeholder="Comma separated tags e.g. remote, urgent"
                                />
                                {errors.tags && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.tags}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button - Fixed Footer */}
                    <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", marginLeft: "-2px", marginRight: "-2px", paddingLeft: "2px", paddingRight: "2px" }}>
                        {isEditMode && job?.is_deleted && (
                            <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                <span className="text-sm text-red-600">This job has been deleted and cannot be updated.</span>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting || (isEditMode && job?.is_deleted)}
                            className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: "#1f2937", boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)" }}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                                </>
                            ) : (
                                <span>{isEditMode ? "Update Job" : "Create Job"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
