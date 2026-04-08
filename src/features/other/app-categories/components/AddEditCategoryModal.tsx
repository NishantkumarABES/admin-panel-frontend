import { useState, useEffect, useRef } from "react";
import { AlertCircle, Upload, X, RefreshCw, Trash2 } from "lucide-react";
import type { AppCategory, CreateAppCategoryDTO, UpdateAppCategoryDTO } from "../app_categories.types";
import Modal from "../../../../components/common/Modal";

interface AddEditCategoryModalProps {
    category?: AppCategory | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateAppCategoryDTO | UpdateAppCategoryDTO) => Promise<{ error?: string }>;
}

const initialFormData: CreateAppCategoryDTO = {
    key: "",
    label: "",
    image: "",
};

const MAX_TEXT_LENGTH = 50;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/webp", "image/jpeg"];

export default function AddEditCategoryModal({ category, isOpen, onClose, onSubmit }: AddEditCategoryModalProps) {
    const BackendBaseURL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8000";
    const isEditMode = !!category;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<CreateAppCategoryDTO | UpdateAppCategoryDTO>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
        const [imagePreview, setImagePreview] = useState("");

        useEffect(() => {
                const style = document.createElement("style");
                style.textContent = `
            .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }
        `;
                document.head.appendChild(style);
                return () => {
                        document.head.removeChild(style);
                };
        }, []);

    useEffect(() => {
        if (category) {
            setFormData({
                id: category.id,
                key: category.key,
                label: category.label,
                image: category.image,
            });
                        setImagePreview(category.image);
        } else {
            setFormData(initialFormData);
                        setImagePreview("");
        }
        setSubmitSuccess(false);
        setSubmitError(null);
        setErrors({});
    }, [category, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.key?.trim()) {
            newErrors.key = "Category key is required";
        } else if (formData.key.length < 2) {
            newErrors.key = "Key must be at least 2 characters";
        } else if (formData.key.length > MAX_TEXT_LENGTH) {
            newErrors.key = `Category key cannot exceed ${MAX_TEXT_LENGTH} characters`;
        }
        if (!formData.label?.trim()) {
            newErrors.label = "Category label is required";
        } else if (formData.label.length < 2) {
            newErrors.label = "Label must be at least 2 characters";
        } else if (formData.label.length > MAX_TEXT_LENGTH) {
            newErrors.label = `Display label cannot exceed ${MAX_TEXT_LENGTH} characters`;
        }

        if (formData.image instanceof File) {
            if (!ALLOWED_IMAGE_TYPES.includes(formData.image.type)) {
                newErrors.image = "Only PNG, WEBP, JPEG, and JPG images are allowed";
            } else if (formData.image.size > MAX_IMAGE_SIZE_BYTES) {
                newErrors.image = "Image size must be 2MB or less";
            }
        }

        const hasImage = formData.image instanceof File || (typeof formData.image === "string" && !!formData.image.trim());
        if (!hasImage) {
            newErrors.image = "Category image is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const result = await onSubmit(formData);
            if (result.error) {
                setSubmitError(result.error);
            } else {
                setSubmitSuccess(true);
                setTimeout(() => { handleClose(); }, 1500);
            }
        } catch (error: any) {
            setSubmitError(error?.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData(initialFormData);
        setErrors({});
        setSubmitError(null);
        setSubmitSuccess(false);
        setImagePreview("");
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "key") {
            if (value.length >= MAX_TEXT_LENGTH) {
                setErrors((prev) => ({ ...prev, key: `Category key cannot exceed ${MAX_TEXT_LENGTH} characters` }));
            } else {
                setErrors((prev) => ({ ...prev, key: "" }));
            }
            return;
        }

        if (name === "label") {
            if (value.length >= MAX_TEXT_LENGTH) {
                setErrors((prev) => ({ ...prev, label: `Display label cannot exceed ${MAX_TEXT_LENGTH} characters` }));
            } else {
                setErrors((prev) => ({ ...prev, label: "" }));
            }
            return;
        }

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setErrors((prev) => ({ ...prev, image: "Only PNG, WEBP, JPEG, and JPG images are allowed" }));
            e.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setErrors((prev) => ({ ...prev, image: "Image size must be 2MB or less" }));
            e.target.value = "";
            return;
        }

        setFormData((prev) => ({ ...prev, image: file }));
        setImagePreview(URL.createObjectURL(file));

        if (errors.image) {
            setErrors((prev) => ({ ...prev, image: "" }));
        }
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, image: "" }));
        setImagePreview("");
        setErrors((prev) => ({ ...prev, image: "" }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (replaceInputRef.current) {
            replaceInputRef.current.value = "";
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditMode ? `Edit Category: ${category?.label}` : "Create Category"}
            size="md"
            contentClassName="overflow-hidden"
        >
            <div className="flex flex-col h-full">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 z-10 active:scale-95 active:shadow-inner"
                    style={{
                        background: "#f8f9fb",
                        boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.6)"
                    }}
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Success State */}
                {submitSuccess ? (
                    <div className="space-y-4 max-h-[calc(80vh-140px)] overflow-y-auto pr-2 custom-scrollbar" style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#cbd5e1 transparent"
                    }}>
                        <div className="flex items-center gap-3 p-4 rounded-xl" style={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            boxShadow: "4px 4px 12px rgba(16, 185, 129, 0.2), -2px -2px 8px rgba(255, 255, 255, 0.1)"
                        }}>
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-base">
                                    Category {isEditMode ? "Updated" : "Created"} Successfully!
                                </h3>
                                <p className="text-white/90 text-xs mt-0.5">
                                    <span className="font-medium">{formData.label}</span> has been {isEditMode ? "updated" : "created"}.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleClose}
                            className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                            style={{
                                background: "#1f2937",
                                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                            }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar" style={{
                            maxHeight: "calc(80vh - 140px)",
                            scrollbarWidth: "thin",
                            scrollbarColor: "#cbd5e1 transparent"
                        }}>
                            {/* Error Message */}
                            {submitError && (
                                <div className="flex items-start gap-3 p-3 rounded-xl" style={{
                                    background: "#fee",
                                    border: "1px solid #fcc"
                                }}>
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{submitError}</p>
                                </div>
                            )}

                            {/* Category Details Section */}
                            <div className="rounded-xl px-5 py-4" style={{
                                background: "#f8f9fb",
                                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
                            }}>
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                    Category Details
                                </h3>

                                {/* Key */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Key *
                                    </label>
                                    <input
                                        type="text"
                                        name="key"
                                        value={formData.key}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                        style={{
                                            background: "#ffffff",
                                            border: errors.key ? "1px solid #ef4444" : "1px solid #e5e7eb",
                                            boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                                        }}
                                        placeholder="e.g., Anaesthesiology"
                                        maxLength={MAX_TEXT_LENGTH}
                                    />
                                    {errors.key && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.key}
                                        </p>
                                    )}
                                </div>

                                {/* Label */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Display Label *
                                    </label>
                                    <input
                                        type="text"
                                        name="label"
                                        value={formData.label}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                        style={{
                                            background: "#ffffff",
                                            border: errors.label ? "1px solid #ef4444" : "1px solid #e5e7eb",
                                            boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                                        }}
                                        placeholder="e.g., Anaesthesia Specialist"
                                        maxLength={MAX_TEXT_LENGTH}
                                    />
                                    {errors.label && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.label}
                                        </p>
                                    )}
                                </div>

                                {/* Category Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Image *
                                    </label>
                                    <div className="rounded-xl p-3" style={{
                                        background: "#ffffff",
                                        border: errors.image ? "1px solid #ef4444" : "1px solid #e5e7eb",
                                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                                    }}>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".png,.webp,.jpeg,.jpg,image/png,image/webp,image/jpeg"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                        <input
                                            ref={replaceInputRef}
                                            type="file"
                                            accept=".png,.webp,.jpeg,.jpg,image/png,image/webp,image/jpeg"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />

                                        {imagePreview ? (
                                            <div
                                                className="relative h-56 rounded-lg overflow-hidden group"
                                                style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)", background: "#f9fafb" }}
                                            >
                                                <img
                                                    src={imagePreview.startsWith("http") || imagePreview.startsWith("blob:")
                                                        ? imagePreview
                                                        : BackendBaseURL + imagePreview}
                                                    alt="Category preview"
                                                    className="w-full h-full object-contain"
                                                />

                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => replaceInputRef.current?.click()}
                                                        className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-all"
                                                        title="Replace image"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveImage}
                                                        className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-all"
                                                        title="Delete image"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full px-4 py-5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-sm text-gray-500 transition-all hover:text-gray-700 hover:border-gray-300"
                                                style={{
                                                    background: "#ffffff",
                                                    border: "2px dashed rgba(0,0,0,0.12)",
                                                    boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                                                }}
                                            >
                                                <Upload className="w-5 h-5" />
                                                <span>Click to upload image</span>
                                                <span className="text-[10px] text-gray-400">PNG, JPG, JPEG, WebP · Max 2 MB</span>
                                            </button>
                                        )}
                                    </div>

                                    {errors.image && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.image}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Doctor Count (read-only in edit mode) */}
                            {isEditMode && category && (
                                <div className="rounded-xl px-5 py-4" style={{
                                    background: "#f8f9fb",
                                    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
                                }}>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                        Statistics
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Doctors in this category:</span>
                                        <span className="text-sm font-semibold" style={{ color: "#6366f1" }}>
                                            {category.doctor_count}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
                            borderTop: "1px solid rgba(0,0,0,0.06)",
                            marginLeft: "-2px",
                            marginRight: "-2px",
                            paddingLeft: "2px",
                            paddingRight: "2px"
                        }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{
                                    background: "#1f2937",
                                    boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                                    </>
                                ) : (
                                    <span>{isEditMode ? "Update Category" : "Create Category"}</span>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
