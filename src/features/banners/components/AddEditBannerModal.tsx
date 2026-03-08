import { useState, useEffect, useRef } from "react";
import { AlertCircle, X, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import type { Banner, CreateBannerDTO, UpdateBannerDTO, Category } from "../banner.types";
import Modal from "../../../components/common/Modal";

interface AddEditBannerModalProps {
    banner?: Banner | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateBannerDTO | UpdateBannerDTO) => Promise<{ error?: string }>;
    activeBannerCount: number;
}

export default function AddEditBannerModal({
    banner,
    isOpen,
    onClose,
    onSubmit,
    activeBannerCount,
}: AddEditBannerModalProps) {
    const isEditMode = !!banner;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [redirectCategory, setRedirectCategory] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [order, setOrder] = useState(1);
    const categories: Category[] = [
        { key: "diagnostics", label: "Diagnostics" },
        { key: "ppe", label: "PPE" },
        { key: "monitoring", label: "Monitoring" },
        { key: "supplies", label: "Supplies" },
        { key: "medicine", label: "Medicine" },
        { key: "skin_care", label: "Skin Care" },
        { key: "vitamins_minerals", label: "Vitamins & Minerals" },
        { key: "baby_care", label: "Baby Care" },
        { key: "pain_relief", label: "Pain Relief" },
        { key: "diabetic_care", label: "Diabetic Care" },
        { key: "protein_supplements", label: "Protein Supplements" },
        { key: "personal_care_hygiene", label: "Personal Care & Hygiene" },
        { key: "fitness_wellness_equipment", label: "Fitness & Wellness Equipment" },
    ];
    const [categorySearch, setCategorySearch] = useState("");
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Populate form in edit mode
    useEffect(() => {
        if (banner) {
            setTitle(banner.title);
            setSubtitle(banner.subtitle || "");
            setImageFile(null);
            setImagePreview(banner.image || null);
            setRedirectCategory(banner.redirect_category);
            setIsActive(banner.is_active ?? true);
            setOrder(banner.order ?? 1);
        } else {
            resetForm();
        }
        setSubmitSuccess(false);
        setSubmitError(null);
        setErrors({});
    }, [banner, isOpen]);

    // Close category dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                categoryDropdownRef.current &&
                !categoryDropdownRef.current.contains(e.target as Node)
            ) {
                setIsCategoryDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const resetForm = () => {
        setTitle("");
        setSubtitle("");
        setImageFile(null);
        setImagePreview(null);
        setRedirectCategory("");
        setIsActive(true);
        setOrder(1);
        setCategorySearch("");
    };

    const handleClose = () => {
        resetForm();
        setErrors({});
        setSubmitError(null);
        setSubmitSuccess(false);
        onClose();
    };

    const maxOrder = isEditMode ? activeBannerCount : activeBannerCount + 1;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!title.trim()) newErrors.title = "Title is required";
        if (!isEditMode && !imageFile) newErrors.image = "Image is required";
        if (!redirectCategory) newErrors.redirect_category = "Redirect category is required";
        if (order < 1 || order > maxOrder) {
            newErrors.order = `Order must be between 1 and ${maxOrder}`;
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
            let data: CreateBannerDTO | UpdateBannerDTO;
            if (isEditMode && banner) {
                data = {
                    id: banner.id,
                    title,
                    subtitle: subtitle || undefined,
                    image: imageFile || undefined,
                    redirect_category: redirectCategory,
                    is_active: isActive,
                    order,
                } as UpdateBannerDTO;
            } else {
                data = {
                    title,
                    subtitle: subtitle || undefined,
                    image: imageFile!,
                    redirect_category: redirectCategory,
                    is_active: isActive,
                    order,
                } as CreateBannerDTO;
            }

            const result = await onSubmit(data);
            if (result.error) {
                setSubmitError(result.error);
            } else {
                setSubmitSuccess(true);
                setTimeout(() => handleClose(), 1500);
            }
        } catch (error: any) {
            setSubmitError(
                error?.message || "An unexpected error occurred. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageSelect = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({ ...prev, image: "Please select a valid image file" }));
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setErrors((prev) => ({ ...prev, image: "" }));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageSelect(file);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(isEditMode && banner?.image ? banner.image : null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const filteredCategories = categories.filter((c) =>
        c.label.toLowerCase().includes(categorySearch.toLowerCase())
    );

    const selectedCategoryLabel =
        categories.find((c) => c.key === redirectCategory)?.label || redirectCategory;

    const insetPanelStyle = {
        background: "#f8f9fb",
        boxShadow:
            "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
    };

    const inputStyle = (hasError: boolean) => ({
        background: "#ffffff",
        border: hasError ? "1px solid #ef4444" : "1px solid #e5e7eb",
        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditMode ? `Edit Banner: ${banner?.title}` : "Create Banner"}
            size="md"
        >
            <div className="flex flex-col h-full">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 z-10 active:scale-95 active:shadow-inner"
                    style={{
                        background: "#f8f9fb",
                        boxShadow:
                            "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.6)",
                    }}
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {submitSuccess ? (
                    <div className="space-y-4 max-h-[calc(80vh-140px)] overflow-y-auto pr-2">
                        <div
                            className="flex items-center gap-3 p-4 rounded-xl"
                            style={{
                                background:
                                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                boxShadow:
                                    "4px 4px 12px rgba(16, 185, 129, 0.2), -2px -2px 8px rgba(255, 255, 255, 0.1)",
                            }}
                        >
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-base">
                                    Banner {isEditMode ? "Updated" : "Created"}{" "}
                                    Successfully!
                                </h3>
                                <p className="text-white/90 text-xs mt-0.5">
                                    <span className="font-medium">{title}</span> has
                                    been {isEditMode ? "updated" : "created"}.
                                </p>
                            </div>
                        </div>
                        <div
                            className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4"
                            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                        >
                            <button
                                onClick={handleClose}
                                className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                                style={{
                                    background: "#1f2937",
                                    boxShadow:
                                        "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <div
                            className="flex-1 overflow-y-auto pr-2 space-y-5"
                            style={{
                                maxHeight: "calc(80vh - 140px)",
                                scrollbarWidth: "thin",
                                scrollbarColor: "#cbd5e1 transparent",
                            }}
                        >
                            {/* Error Banner */}
                            {submitError && (
                                <div
                                    className="flex items-start gap-3 p-3 rounded-xl"
                                    style={{
                                        background: "#fee",
                                        border: "1px solid #fcc",
                                    }}
                                >
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">
                                        {submitError}
                                    </p>
                                </div>
                            )}

                            {/* Banner Details */}
                            <div className="rounded-xl px-5 py-4" style={insetPanelStyle}>
                                <h3
                                    className="text-sm font-semibold text-gray-900 mb-4 pb-2"
                                    style={{
                                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                                    }}
                                >
                                    Banner Details
                                </h3>

                                {/* Title */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            if (errors.title)
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    title: "",
                                                }));
                                        }}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                        style={inputStyle(!!errors.title)}
                                        placeholder="e.g., Summer Sale Banner"
                                    />
                                    {errors.title && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Subtitle */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subtitle
                                    </label>
                                    <textarea
                                        value={subtitle}
                                        onChange={(e) => setSubtitle(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                        style={inputStyle(false)}
                                        rows={2}
                                        placeholder="Optional subtitle text"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="rounded-xl px-5 py-4" style={insetPanelStyle}>
                                <h3
                                    className="text-sm font-semibold text-gray-900 mb-4 pb-2"
                                    style={{
                                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                                    }}
                                >
                                    Banner Image {!isEditMode && "*"}
                                </h3>

                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Banner preview"
                                            className="w-full rounded-xl object-cover"
                                            style={{
                                                maxHeight: "200px",
                                                border: "1px solid #e5e7eb",
                                            }}
                                        />
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                                                style={{
                                                    background: "#ffffff",
                                                    border: "1px solid #e5e7eb",
                                                    color: "#374151",
                                                }}
                                            >
                                                <Upload className="w-3 h-3" />
                                                Replace
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                                                style={{
                                                    background: "#ffffff",
                                                    border: "1px solid #fecaca",
                                                    color: "#dc2626",
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`flex flex-col items-center justify-center p-8 rounded-xl cursor-pointer transition-all duration-200 ${isDragging ? "scale-[1.02]" : ""}`}
                                        style={{
                                            border: errors.image
                                                ? "2px dashed #ef4444"
                                                : isDragging
                                                    ? "2px dashed #6366f1"
                                                    : "2px dashed #d1d5db",
                                            background: isDragging
                                                ? "rgba(99, 102, 241, 0.04)"
                                                : "#ffffff",
                                        }}
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleDrop}
                                    >
                                        <div
                                            className="clay-circle mb-3"
                                            style={{
                                                background:
                                                    "rgba(107, 150, 255, 0.08)",
                                                width: "48px",
                                                height: "48px",
                                            }}
                                        >
                                            <ImageIcon
                                                className="w-5 h-5"
                                                style={{ color: "#6b96ff" }}
                                            />
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Drop your image here, or{" "}
                                            <span style={{ color: "#6b96ff" }}>
                                                browse
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            PNG, JPG, WebP up to 5MB
                                        </p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageSelect(file);
                                    }}
                                />
                                {errors.image && (
                                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.image}
                                    </p>
                                )}
                            </div>

                            {/* Configuration */}
                            <div className="rounded-xl px-5 py-4" style={insetPanelStyle}>
                                <h3
                                    className="text-sm font-semibold text-gray-900 mb-4 pb-2"
                                    style={{
                                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                                    }}
                                >
                                    Configuration
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Redirect Category */}
                                    <div ref={categoryDropdownRef} className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Redirect Category *
                                        </label>
                                        <div
                                            className="w-full px-4 py-2.5 text-sm rounded-xl cursor-pointer flex items-center justify-between"
                                            style={inputStyle(!!errors.redirect_category)}
                                            onClick={() =>
                                                setIsCategoryDropdownOpen(
                                                    !isCategoryDropdownOpen
                                                )
                                            }
                                        >
                                            <span
                                                className={
                                                    redirectCategory
                                                        ? "text-gray-900"
                                                        : "text-gray-400"
                                                }
                                            >
                                                {redirectCategory
                                                    ? selectedCategoryLabel
                                                    : "Select category"}
                                            </span>
                                            <svg
                                                className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                        {isCategoryDropdownOpen && (
                                            <div
                                                className="absolute z-20 mt-1 w-full rounded-xl overflow-hidden"
                                                style={{
                                                    background: "#ffffff",
                                                    border: "1px solid #e5e7eb",
                                                    boxShadow:
                                                        "0 4px 12px rgba(0, 0, 0, 0.08)",
                                                    maxHeight: "200px",
                                                }}
                                            >
                                                <div className="p-2">
                                                    <input
                                                        type="text"
                                                        value={categorySearch}
                                                        onChange={(e) =>
                                                            setCategorySearch(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full px-3 py-1.5 text-sm rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
                                                        style={inputStyle(false)}
                                                        placeholder="Search categories..."
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    />
                                                </div>
                                                <div
                                                    className="overflow-y-auto"
                                                    style={{ maxHeight: "150px" }}
                                                >
                                                    {filteredCategories.length ===
                                                        0 ? (
                                                        <div className="px-3 py-2 text-xs text-gray-400">
                                                            No categories found
                                                        </div>
                                                    ) : (
                                                        filteredCategories.map(
                                                            (cat) => (
                                                                <button
                                                                    type="button"
                                                                    key={cat.key}
                                                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${redirectCategory === cat.key ? "font-medium" : ""}`}
                                                                    style={
                                                                        redirectCategory ===
                                                                            cat.key
                                                                            ? {
                                                                                background:
                                                                                    "rgba(107, 150, 255, 0.08)",
                                                                                color: "#6b96ff",
                                                                            }
                                                                            : {}
                                                                    }
                                                                    onClick={() => {
                                                                        setRedirectCategory(
                                                                            cat.key
                                                                        );
                                                                        setIsCategoryDropdownOpen(
                                                                            false
                                                                        );
                                                                        setCategorySearch(
                                                                            ""
                                                                        );
                                                                        if (
                                                                            errors.redirect_category
                                                                        )
                                                                            setErrors(
                                                                                (
                                                                                    prev
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    redirect_category:
                                                                                        "",
                                                                                })
                                                                            );
                                                                    }}
                                                                >
                                                                    {cat.label}
                                                                </button>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {errors.redirect_category && (
                                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.redirect_category}
                                            </p>
                                        )}
                                    </div>

                                    {/* Display Order */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Display Order *
                                        </label>
                                        <input
                                            type="number"
                                            value={order}
                                            onChange={(e) => {
                                                setOrder(
                                                    parseInt(e.target.value) || 1
                                                );
                                                if (errors.order)
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        order: "",
                                                    }));
                                            }}
                                            min="1"
                                            max={maxOrder}
                                            className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                            style={inputStyle(!!errors.order)}
                                            placeholder="1"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Allowed range: 1 – {maxOrder} (lower = higher priority)
                                        </p>
                                        {errors.order && (
                                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.order}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="rounded-xl px-5 py-4" style={insetPanelStyle}>
                                <h3
                                    className="text-sm font-semibold text-gray-900 mb-4 pb-2"
                                    style={{
                                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                                    }}
                                >
                                    Status
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Active Status
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={isActive}
                                            onClick={() => setIsActive(!isActive)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`}
                                            />
                                        </button>
                                        <span
                                            className={`text-sm font-medium ${isActive ? "text-emerald-600" : "text-gray-500"}`}
                                        >
                                            {isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5">
                                        {isActive
                                            ? "This banner is visible in the app."
                                            : "This banner is hidden from the app."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Footer */}
                        <div
                            className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4"
                            style={{
                                borderTop: "1px solid rgba(0,0,0,0.06)",
                                marginLeft: "-2px",
                                marginRight: "-2px",
                                paddingLeft: "2px",
                                paddingRight: "2px",
                            }}
                        >
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{
                                    background: "#1f2937",
                                    boxShadow:
                                        "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>
                                            {isEditMode
                                                ? "Updating..."
                                                : "Creating..."}
                                        </span>
                                    </>
                                ) : (
                                    <span>
                                        {isEditMode
                                            ? "Update Banner"
                                            : "Create Banner"}
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
