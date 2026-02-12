import { useState, useEffect, useRef } from "react";
import { X, Search, ChevronDown, Upload, FileText } from "lucide-react";
import type { Book, CreateBookDTO, BookType } from "../books.types";
import { BOOK_TYPES } from "../books.types";
import { SPECIALTIES } from "../../../Advertisements/advertisement.types";
import * as doctorService from "../../../../services/doctor.service";
import type { DoctorUser } from "../../../doctors/doctor.types";

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
    publication_year: new Date().getFullYear(),
    isbn: "",
    speciality: "",
    book_type: "textbook" as BookType,
    description: "",
    price: 0,
};

export default function AddEditBookModal({ isOpen, onClose, onSubmit, book }: AddEditBookModalProps) {
    const isEditMode = !!book;

    const [formData, setFormData] = useState(initialFormData);
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [selectedUser, setSelectedUser] = useState<DoctorUser | null>(null);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [userResults, setUserResults] = useState<DoctorUser[]>([]);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [userSearchLoading, setUserSearchLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Reset form when modal opens/closes or book changes
    useEffect(() => {
        if (isOpen) {
            if (book) {
                // Edit mode: pre-populate form with book data
                setFormData({
                    title: book.title,
                    authors: book.authors,
                    publisher: book.publisher,
                    edition: book.edition,
                    publication_year: book.publication_year,
                    isbn: book.isbn,
                    speciality: book.speciality || "",
                    book_type: book.book_type,
                    description: book.description,
                    price: book.price,
                });
                setBookFile(null);
                setSelectedUser(null);
                setUserSearchTerm("");
            } else {
                // Add mode: reset form
                setFormData(initialFormData);
                setBookFile(null);
                setSelectedUser(null);
                setUserSearchTerm("");
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
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type (PDF, EPUB, etc.)
            const allowedTypes = [
                "application/pdf",
                "application/epub+zip",
                "application/x-mobipocket-ebook",
            ];
            if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|epub|mobi)$/i)) {
                setErrors({ ...errors, book_file: "Only PDF, EPUB, and MOBI files are allowed" });
                return;
            }
            // Validate file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                setErrors({ ...errors, book_file: "File size must be less than 50MB" });
                return;
            }
            setBookFile(file);
            setErrors({ ...errors, book_file: "" });
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
            });
            onClose();
        } catch (error) {
            console.error(`Failed to ${isEditMode ? "update" : "create"} book:`, error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {isEditMode ? "Edit Book" : "Add Book"}
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
                                    {book!.uploaded_by}
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
                                placeholder="Enter book title"
                            />
                            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                        </div>

                        {/* Authors & Publisher */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Authors <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.authors}
                                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.authors ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="Enter author name(s)"
                                />
                                {errors.authors && <p className="text-xs text-red-500 mt-1">{errors.authors}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Publisher <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.publisher}
                                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.publisher ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="Enter publisher"
                                />
                                {errors.publisher && <p className="text-xs text-red-500 mt-1">{errors.publisher}</p>}
                            </div>
                        </div>

                        {/* Edition & Year & ISBN */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Edition</label>
                                <input
                                    type="text"
                                    value={formData.edition}
                                    onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    placeholder="e.g. 3rd"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
                                <input
                                    type="number"
                                    value={formData.publication_year}
                                    onChange={(e) => setFormData({ ...formData, publication_year: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    min={1900}
                                    max={2100}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                                <input
                                    type="text"
                                    value={formData.isbn}
                                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    placeholder="ISBN number"
                                />
                            </div>
                        </div>

                        {/* Specialty & Book Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Book Type</label>
                                <select
                                    value={formData.book_type}
                                    onChange={(e) => setFormData({ ...formData, book_type: e.target.value as BookType })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                >
                                    {BOOK_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Book File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Book File
                                {isEditMode && book!.file_url && (
                                    <span className="text-xs text-gray-500 ml-2">(upload new file to replace)</span>
                                )}
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.epub,.mobi"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {bookFile ? (
                                <div className="flex items-center justify-between px-3 py-3 border border-gray-300 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 shrink-0">
                                            <FileText className="w-4.5 h-4.5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-gray-900 text-sm truncate">{bookFile.name}</div>
                                            <div className="text-xs text-gray-500">{formatFileSize(bookFile.size)}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setBookFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                        className="p-1 rounded text-gray-400 hover:text-gray-600 shrink-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-3 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center gap-2 text-gray-500 hover:text-gray-600"
                                >
                                    <Upload className="w-6 h-6" />
                                    <div className="text-sm font-medium">
                                        {isEditMode ? "Click to upload new book file" : "Click to upload book file"}
                                    </div>
                                    <div className="text-xs">PDF, EPUB, or MOBI (max 50MB)</div>
                                </button>
                            )}
                            {errors.book_file && <p className="text-xs text-red-500 mt-1">{errors.book_file}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                placeholder="Enter book description"
                            />
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
                                ? (isEditMode ? "Updating..." : "Adding...")
                                : (isEditMode ? "Update Book" : "Add Book")
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
