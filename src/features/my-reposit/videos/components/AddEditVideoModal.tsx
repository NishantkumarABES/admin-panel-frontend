import { useState, useEffect, useRef } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import type { Video as VideoType, CreateVideoDTO } from "../videos.types";
import { SPECIALTIES } from "../../../Advertisements/advertisement.types";
import * as doctorService from "../../../../services/doctor.service";
import type { DoctorUser } from "../../../doctors/doctor.types";

interface AddEditVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateVideoDTO) => Promise<void>;
    video: VideoType | null;
}

interface VideoFormData {
    title: string;
    description: string;
    Institution: string;
    speciality: string;
    allow_download: boolean;
    video_file: File | null;
    thumbnail: File | null;
}

const initialFormData: VideoFormData = {
    title: "",
    description: "",
    Institution: "",
    speciality: "",
    allow_download: true,
    video_file: null,
    thumbnail: null,
};

export default function AddEditVideoModal({ isOpen, onClose, onSubmit, video }: AddEditVideoModalProps) {
    const isEditMode = !!video;

    const [formData, setFormData] = useState<VideoFormData>(initialFormData);
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

    // Reset form when modal opens/closes or video changes
    useEffect(() => {
        if (isOpen) {
            if (video) {
                // Edit mode: pre-populate form with video data
                setFormData({
                    title: video.title,
                    description: video.description || "",
                    Institution: video.Institution || "",
                    speciality: video.speciality || "",
                    allow_download: video.allow_download,
                    video_file: null,
                    thumbnail: null,
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
    }, [isOpen, video]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!isEditMode && !selectedUser) newErrors.user_id = "Please select a doctor user";
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.speciality) newErrors.speciality = "Specialty is required";
        if (!isEditMode && !formData.video_file) newErrors.video_file = "Video file is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (!isEditMode && !selectedUser) return;

        try {
            setIsSubmitting(true);
            const submitData: CreateVideoDTO = {
                user_id: isEditMode ? video!.id : selectedUser!.id,
                title: formData.title,
                description: formData.description,
                Institution: formData.Institution,
                speciality: formData.speciality,
                video_file: formData.video_file!,
                allow_download: formData.allow_download,
            };
            if (formData.thumbnail) {
                submitData.thumbnail = formData.thumbnail;
            }
            await onSubmit(submitData);
            onClose();
        } catch (error) {
            console.error(`Failed to ${isEditMode ? "update" : "create"} video:`, error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 transition-opacity" />
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {isEditMode ? "Edit Video" : "Add Video"}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-5">
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
                                                    ) : userSearchTerm ? (
                                                        <div className="px-3 py-3 text-sm text-gray-500 text-center">No doctors found</div>
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
                                    Uploaded By
                                </label>
                                <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
                                    {video!.uploaded_by}
                                </div>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.title ? "border-red-300" : "border-gray-300"
                                    }`}
                                placeholder="Enter video title"
                            />
                            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                        </div>

                        {/* Institution & Specialty */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Institution
                                </label>
                                <input
                                    type="text"
                                    value={formData.Institution}
                                    onChange={(e) => setFormData({ ...formData, Institution: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    placeholder="Enter institution"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Specialty <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.speciality}
                                    onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.speciality ? "border-red-300" : "border-gray-300"
                                        }`}
                                >
                                    <option value="">Select specialty</option>
                                    {SPECIALTIES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                {errors.speciality && <p className="text-xs text-red-500 mt-1">{errors.speciality}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none ${errors.description ? "border-red-300" : "border-gray-300"
                                    }`}
                                placeholder="Enter video description"
                            />
                            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                        </div>

                        {/* Video File (add mode only) */}
                        {!isEditMode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Video File <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setFormData({ ...formData, video_file: e.target.files?.[0] || null })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm ${errors.video_file ? "border-red-300" : "border-gray-300"
                                        }`}
                                />
                                {errors.video_file && <p className="text-xs text-red-500 mt-1">{errors.video_file}</p>}
                            </div>
                        )}

                        {/* Thumbnail */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thumbnail
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Allow Download */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="allow_download"
                                checked={formData.allow_download}
                                onChange={(e) => setFormData({ ...formData, allow_download: e.target.checked })}
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            />
                            <label htmlFor="allow_download" className="text-sm font-medium text-gray-700">
                                Allow Download
                            </label>
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
                            disabled={isSubmitting || (isEditMode && video?.is_deleted)}
                            className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting
                                ? (isEditMode ? "Updating..." : "Adding...")
                                : (isEditMode ? "Update Video" : "Add Video")
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
