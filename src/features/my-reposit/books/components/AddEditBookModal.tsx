import { useState, useEffect, useRef } from "react";
import { X, Search, ChevronDown, Upload, FileText, AlertCircle, ImagePlus } from "lucide-react";
import type { Book, CreateBookDTO, BookType, AccessLevel, CopyrightStatus } from "../books.types";
import { BOOK_TYPES, ACCESS_LEVELS, COPYRIGHT_STATUSES } from "../books.types";
import { SPECIALTIES } from "../../../Advertisements/advertisement.types";
import * as doctorService from "../../../../services/doctor.service";
import type { DoctorUser } from "../../../doctors/doctor.types";
import Modal from "../../../../components/common/Modal";

interface AddEditBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateBookDTO) => Promise<void>;
    book: Book | null;
}

const initialFormData: Omit<CreateBookDTO, "user_id" | "book_file"> = {
    title: "",
    authors: "",
    publisher: "",
    edition: "",
    publishing_date: new Date().toISOString().split('T')[0],
    isbn: "",
    speciality: "",
    book_type: "textbook" as BookType,
    access_level: "public" as AccessLevel,
    copyright_status: "open" as CopyrightStatus,
    description: "",
    price: 0,
};

export default function AddEditBookModal({ isOpen, onClose, onSubmit, book }: AddEditBookModalProps) {
    const isEditMode = !!book;

    const [formData, setFormData] = useState(initialFormData);
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<DoctorUser | null>(null);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [userResults, setUserResults] = useState<DoctorUser[]>([]);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [userSearchLoading, setUserSearchLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

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

    // Reset form when modal opens/closes or book changes
    useEffect(() => {
        if (isOpen) {
            if (book) {
                setFormData({
                    title: book.title, authors: book.authors, publisher: book.publisher,
                    edition: book.edition, publishing_date: book.publishing_date || new Date().toISOString().split('T')[0],
                    isbn: book.isbn, speciality: book.speciality || "",
                    book_type: book.book_type, access_level: book.access_level,
                    copyright_status: book.copyright_status, description: book.description,
                    price: book.price,
                });
                setBookFile(null); setCoverFile(null); setCoverPreview(book.book_cover || null); setSelectedUser(null); setUserSearchTerm("");
            } else {
                setFormData(initialFormData); setBookFile(null); setCoverFile(null); setCoverPreview(null); setSelectedUser(null); setUserSearchTerm("");
            }
            setErrors({});
        }
    }, [isOpen, book]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!isEditMode && !selectedUser) newErrors.user_id = "Please select a doctor user";
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.authors.trim()) newErrors.authors = "Authors is required";
        if (!formData.publisher.trim()) newErrors.publisher = "Publisher is required";
        if (!formData.speciality) newErrors.speciality = "Specialty is required";
        if (!formData.book_type) newErrors.book_type = "Book type is required";
        if (!formData.access_level) newErrors.access_level = "Access level is required";
        if (!formData.copyright_status) newErrors.copyright_status = "Copyright status is required";
        if (formData.isbn && !/^\d{13}$/.test(formData.isbn)) newErrors.isbn = "ISBN must be exactly 13 digits";
        if (formData.description.length > 1000) newErrors.description = "Description must not exceed 1000 characters";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = ["application/pdf", "application/epub+zip", "application/x-mobipocket-ebook"];
            if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|epub|mobi)$/i)) {
                setErrors({ ...errors, book_file: "Only PDF, EPUB, and MOBI files are allowed" });
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                setErrors({ ...errors, book_file: "File size must be less than 50MB" });
                return;
            }
            setBookFile(file);
            setErrors({ ...errors, book_file: "" });
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                setErrors({ ...errors, book_cover: "Only JPEG, PNG, and WebP images are allowed" });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, book_cover: "Image size must be less than 5MB" });
                return;
            }
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
            setErrors({ ...errors, book_cover: "" });
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (!isEditMode && !selectedUser) return;
        try {
            setIsSubmitting(true);
            await onSubmit({
                ...formData,
                user_id: isEditMode ? (book!.id) : selectedUser!.id,
                book_file: bookFile || undefined,
                book_cover: coverFile || undefined,
            });
            onClose();
        } catch (error) { console.error(`Failed to ${isEditMode ? "update" : "create"} book:`, error); }
        finally { setIsSubmitting(false); }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Book" : "Add Book"}>
            <div className="flex flex-col h-full">
                {/* Close Button */}
                <button
                    type="button" onClick={onClose}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Uploaded By</label>
                                    <div className="px-4 py-2.5 text-sm rounded-xl text-gray-700" style={{ ...inputStyle(), background: "#f8f9fb" }}>
                                        {book!.uploaded_by}
                                    </div>
                                </div>
                            )}

                            {/* Title */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                <input type="text" value={formData.title} onChange={(e) => { if (e.target.value.length <= 60) setFormData({ ...formData, title: e.target.value }); }} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.title || formData.title.length >= 60)} placeholder="Enter book title" maxLength={60} />
                                {(errors.title || formData.title.length >= 60) && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title || "Title cannot exceed 60 characters"}</p>}
                            </div>

                            {/* Authors & Publisher */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Authors *</label>
                                    <input type="text" value={formData.authors} onChange={(e) => setFormData({ ...formData, authors: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.authors)} placeholder="Enter author name(s)" />
                                    {errors.authors && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.authors}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Publisher *</label>
                                    <input type="text" value={formData.publisher} onChange={(e) => { if (e.target.value.length <= 50) setFormData({ ...formData, publisher: e.target.value }); }} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.publisher || formData.publisher.length >= 50)} placeholder="Enter publisher" maxLength={50} />
                                    {(errors.publisher || formData.publisher.length >= 50) && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.publisher || "Publisher cannot exceed 50 characters"}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                Book Details
                            </h3>

                            {/* Edition, Publishing Date, ISBN */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Edition</label>
                                    <input type="text" value={formData.edition} onChange={(e) => setFormData({ ...formData, edition: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle()} placeholder="e.g. 3rd" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Publishing Date</label>
                                    <input type="date" value={formData.publishing_date} onChange={(e) => setFormData({ ...formData, publishing_date: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle()} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                                    <input type="text" value={formData.isbn} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 13); setFormData({ ...formData, isbn: v }); }} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.isbn || formData.isbn.length >= 13)} placeholder="ISBN number (13 digits)" maxLength={13} />
                                    {(errors.isbn || formData.isbn.length >= 13) && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.isbn || "ISBN has reached the 13-digit limit"}</p>}
                                </div>
                            </div>

                            {/* Specialty & Book Type */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty *</label>
                                    <select value={formData.speciality} onChange={(e) => setFormData({ ...formData, speciality: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.speciality)}>
                                        <option value="">Select specialty</option>
                                        {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    {errors.speciality && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.speciality}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Book Type</label>
                                    <select value={formData.book_type} onChange={(e) => setFormData({ ...formData, book_type: e.target.value as BookType })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle()}>
                                        {BOOK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Access Level & Copyright Status */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Level *</label>
                                    <select value={formData.access_level} onChange={(e) => setFormData({ ...formData, access_level: e.target.value as AccessLevel })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.access_level)}>
                                        {ACCESS_LEVELS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                    {errors.access_level && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.access_level}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Status *</label>
                                    <select value={formData.copyright_status} onChange={(e) => setFormData({ ...formData, copyright_status: e.target.value as CopyrightStatus })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle(!!errors.copyright_status)}>
                                        {COPYRIGHT_STATUSES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                    {errors.copyright_status && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.copyright_status}</p>}
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all" style={inputStyle()} min={0} step="0.01" placeholder="0.00" />
                            </div>
                        </div>

                        {/* Cover Image Section */}
                        <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                Cover Image
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Book Cover
                                    {isEditMode && book!.book_cover && (
                                        <span className="text-xs text-gray-500 ml-2">(upload new image to replace)</span>
                                    )}
                                </label>
                                <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="hidden" />
                                {coverPreview ? (
                                    <div className="flex items-start gap-4 px-4 py-3 rounded-xl" style={{ ...inputStyle(), background: "#f8f9fb" }}>
                                        <img
                                            src={coverPreview}
                                            alt="Book cover preview"
                                            className="w-20 h-28 object-cover rounded-lg shrink-0"
                                            style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.1)" }}
                                        />
                                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                                            <div className="font-medium text-gray-900 text-sm truncate">
                                                {coverFile ? coverFile.name : "Current cover"}
                                            </div>
                                            {coverFile && (
                                                <div className="text-xs text-gray-500">{formatFileSize(coverFile.size)}</div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => { setCoverFile(null); setCoverPreview(null); if (coverInputRef.current) coverInputRef.current.value = ""; }}
                                                className="mt-1 text-xs text-red-500 hover:text-red-700 self-start"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => coverInputRef.current?.click()}
                                        className="w-full px-4 py-5 border-2 border-dashed rounded-xl transition-all flex flex-col items-center gap-2 text-gray-500 hover:text-gray-600 hover:border-gray-400"
                                        style={{ borderColor: "#d1d5db", background: "transparent" }}
                                    >
                                        <ImagePlus className="w-6 h-6" />
                                        <div className="text-sm font-medium">
                                            {isEditMode ? "Click to upload new cover image" : "Click to upload cover image"}
                                        </div>
                                        <div className="text-xs">JPEG, PNG, or WebP (max 5MB)</div>
                                    </button>
                                )}
                                {errors.book_cover && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.book_cover}</p>}
                            </div>
                        </div>

                        {/* File & Description Section */}
                        <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                File & Description
                            </h3>

                            {/* Book File Upload */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Book File
                                    {isEditMode && book!.file_url && (
                                        <span className="text-xs text-gray-500 ml-2">(upload new file to replace)</span>
                                    )}
                                </label>
                                <input ref={fileInputRef} type="file" accept=".pdf,.epub,.mobi" onChange={handleFileChange} className="hidden" />
                                {bookFile ? (
                                    <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ ...inputStyle(), background: "#f8f9fb" }}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 shrink-0">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 text-sm truncate">{bookFile.name}</div>
                                                <div className="text-xs text-gray-500">{formatFileSize(bookFile.size)}</div>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => { setBookFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="p-1 rounded text-gray-400 hover:text-gray-600 shrink-0">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : isEditMode && book!.file_url ? (
                                    <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ ...inputStyle(), background: "#f8f9fb" }}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 shrink-0">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 text-sm truncate">
                                                    {book!.file_url.split('/').pop() || "Current book file"}
                                                </div>
                                                <div className="text-xs text-gray-500">Existing file</div>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0">
                                            Replace
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full px-4 py-5 border-2 border-dashed rounded-xl transition-all flex flex-col items-center gap-2 text-gray-500 hover:text-gray-600 hover:border-gray-400"
                                        style={{ borderColor: "#d1d5db", background: "transparent" }}
                                    >
                                        <Upload className="w-6 h-6" />
                                        <div className="text-sm font-medium">Click to upload book file</div>
                                        <div className="text-xs">PDF, EPUB, or MOBI (max 50MB)</div>
                                    </button>
                                )}
                                {errors.book_file && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.book_file}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea value={formData.description} onChange={(e) => { if (e.target.value.length <= 1000) setFormData({ ...formData, description: e.target.value }); }} rows={3} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all resize-none" style={inputStyle(!!errors.description)} placeholder="Enter book description" maxLength={1000} />
                                <div className="mt-1.5 flex items-center justify-between">
                                    {errors.description ? <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p> : <span />}
                                    <span className={`text-xs ${formData.description.length >= 1000 ? 'text-red-500' : 'text-gray-400'}`}>{formData.description.length}/1000</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button - Fixed Footer */}
                    <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", marginLeft: "-2px", marginRight: "-2px", paddingLeft: "2px", paddingRight: "2px" }}>
                        {isEditMode && book?.is_deleted && (
                            <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                <span className="text-sm text-red-600">This book has been deleted and cannot be updated.</span>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting || (isEditMode && book?.is_deleted)}
                            className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: "#1f2937", boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)" }}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>{isEditMode ? "Updating..." : "Adding..."}</span>
                                </>
                            ) : (
                                <span>{isEditMode ? "Update Book" : "Add Book"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
