import { useState, useEffect, useRef } from "react";
import type { Event, CreateEventDTO, EventType, EventFormat, SpeakerFormData } from "../event.types";
import { EVENT_TYPES, EVENT_FORMATS, SPECIALIZATIONS } from "../event.types";
import { ChevronDown, Search, AlertCircle, X, Upload, Plus, Trash2, RefreshCw } from "lucide-react";
import Modal from "../../../components/common/Modal";

interface AddEditEventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEventDTO) => Promise<{ error?: string }>;
}

const initialFormData: CreateEventDTO = {
  title: "",
  description: "",
  event_type: "webinar",
  specialization: "",
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  format: "live",
  is_free: true,
  registration_fee: "0.00",
  is_certificate_available: false,
  agenda: "",
  venue: "",
  event_link: "",
  is_featured: false,
  images: [],
  speakers: [],
};

const initialSpeaker: SpeakerFormData = {
  name: "",
  title: "",
  bio: "",
  image: null,
};

const inputStyle = (hasError = false) => ({
  background: "#ffffff",
  border: hasError ? "1px solid #ef4444" : "1px solid #e5e7eb",
  boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
});

const sectionStyle = {
  background: "#f8f9fb",
  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
};

export default function AddEditEventModal({
  event, isOpen, onClose, onSubmit,
}: AddEditEventModalProps) {
  const BackendBaseURL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8000';
  const [formData, setFormData] = useState<CreateEventDTO>(initialFormData);
  const [specializationSearch, setSpecializationSearch] = useState("");
  const [isSpecializationDropdownOpen, setIsSpecializationDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Image preview
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Speaker image previews
  const [speakerImagePreviews, setSpeakerImagePreviews] = useState<(string | null)[]>([]);

  // Add scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
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
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        event_type: event.event_type,
        specialization: event.specialization || "",
        start_date: event.start_date || "",
        end_date: event.end_date || "",
        start_time: event.start_time || "",
        end_time: event.end_time || "",
        format: event.format,
        is_free: event.is_free,
        registration_fee: event.registration_fee || "0.00",
        is_certificate_available: event.is_certificate_available,
        agenda: event.agenda || "",
        venue: event.venue || "",
        event_link: event.event_link || "",
        is_featured: event.is_featured,
        images: [],
        speakers: event.speakers?.map(speaker => ({
          name: speaker.name,
          title: speaker.title,
          bio: speaker.bio || "",
          image: null,
        })) || [],
      });
      if (event.images && event.images.length > 0) {
        setImagePreviews(event.images.map(img => img.image_url));
      }
      if (event.speakers && event.speakers.length > 0) {
        setSpeakerImagePreviews(event.speakers.map(speaker => speaker.image_url || null));
      }
    } else {
      setFormData(initialFormData);
      setImagePreviews([]);
      setSpeakerImagePreviews([]);
    }
    setSubmitSuccess(false);
    setSubmitError(null);
    setValidationErrors({});
  }, [event, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSpecializationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSpecializations = SPECIALIZATIONS.filter((spec) =>
    spec.toLowerCase().includes(specializationSearch.toLowerCase())
  );

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
  const MAX_EVENT_IMAGES = 5;
  const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];
  const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

  const isAllowedImageFile = (file: File): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    return ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES.includes(file.type);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const invalidFiles = files.filter(file => !isAllowedImageFile(file));
      if (invalidFiles.length > 0) {
        setValidationErrors(prev => ({ ...prev, images: "Only PNG, JPG, JPEG, and WebP images are allowed" }));
        e.target.value = "";
        return;
      }
      const currentCount = imagePreviews.length;
      const totalAfterAdd = currentCount + files.length;
      if (totalAfterAdd > MAX_EVENT_IMAGES) {
        setValidationErrors(prev => ({ ...prev, images: `You can upload a maximum of ${MAX_EVENT_IMAGES} images. You already have ${currentCount}.` }));
        e.target.value = "";
        return;
      }
      const oversizedFiles = files.filter(file => file.size > MAX_IMAGE_SIZE);
      if (oversizedFiles.length > 0) {
        setValidationErrors(prev => ({ ...prev, images: "Each image must be less than 2 MB" }));
        e.target.value = "";
        return;
      }
      setValidationErrors(prev => ({ ...prev, images: "" }));
      const newImages = [...(formData.images || []), ...files];
      setFormData({ ...formData, images: newImages });
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleReplaceImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isAllowedImageFile(file)) {
        setValidationErrors(prev => ({ ...prev, images: "Only PNG, JPG, JPEG, and WebP images are allowed" }));
        e.target.value = "";
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setValidationErrors(prev => ({ ...prev, images: "Each image must be less than 2 MB" }));
        e.target.value = "";
        return;
      }
      setValidationErrors(prev => ({ ...prev, images: "" }));
      const newImages = [...(formData.images || [])];
      newImages[index] = file;
      setFormData({ ...formData, images: newImages });
      const newPreviews = [...imagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setImagePreviews(newPreviews);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images?.filter((_, i) => i !== index) || [];
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) {
      errors.title = "Event title is required";
    } else if (formData.title.length > 60) {
      errors.title = "Event title must be less than 60 characters";
    }
    if (!formData.event_type) errors.event_type = "Event type is required";
    if (!formData.start_date) errors.start_date = "Start date is required";
    if (!formData.end_date) errors.end_date = "End date is required";
    if (!formData.start_time) errors.start_time = "Start time is required";
    if (!formData.end_time) errors.end_time = "End time is required";
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.end_date = "End date cannot be before start date";
    }
    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }
    if (formData.agenda && formData.agenda.length > 1000) {
      errors.agenda = "Agenda must be less than 1000 characters";
    }
    if (formData.venue && formData.venue.length > 100) {
      errors.venue = "Venue must be less than 100 characters";
    }
    if (!formData.event_link?.trim()) {
      errors.event_link = "Event link is required";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError(null);
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
    setSpecializationSearch("");
    setIsSpecializationDropdownOpen(false);
    setSubmitSuccess(false);
    setSubmitError(null);
    setValidationErrors({});
    setImagePreviews([]);
    setSpeakerImagePreviews([]);
    onClose();
  };

  const handleSpecializationSelect = (spec: string) => {
    setFormData({ ...formData, specialization: spec });
    setSpecializationSearch("");
    setIsSpecializationDropdownOpen(false);
  };

  const handleAddSpeaker = () => {
    setFormData({
      ...formData,
      speakers: [...(formData.speakers || []), { ...initialSpeaker }],
    });
    setSpeakerImagePreviews([...speakerImagePreviews, null]);
  };

  const handleRemoveSpeaker = (index: number) => {
    const newSpeakers = formData.speakers?.filter((_, i) => i !== index) || [];
    const newPreviews = speakerImagePreviews.filter((_, i) => i !== index);
    setFormData({ ...formData, speakers: newSpeakers });
    setSpeakerImagePreviews(newPreviews);
  };

  const handleSpeakerChange = (index: number, field: keyof SpeakerFormData, value: string) => {
    const newSpeakers = [...(formData.speakers || [])];
    newSpeakers[index] = { ...newSpeakers[index], [field]: value };
    setFormData({ ...formData, speakers: newSpeakers });

    // Real-time character limit validation for name and title
    if (field === 'name') {
      if (value.length >= 50) {
        setValidationErrors(prev => ({ ...prev, [`speaker_name_${index}`]: "Speaker name cannot exceed 50 characters" }));
      } else {
        setValidationErrors(prev => { const next = { ...prev }; delete next[`speaker_name_${index}`]; return next; });
      }
    }
    if (field === 'title') {
      if (value.length >= 50) {
        setValidationErrors(prev => ({ ...prev, [`speaker_title_${index}`]: "Speaker title cannot exceed 50 characters" }));
      } else {
        setValidationErrors(prev => { const next = { ...prev }; delete next[`speaker_title_${index}`]; return next; });
      }
    }
  };

  const handleSpeakerImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isAllowedImageFile(file)) {
        setValidationErrors(prev => ({ ...prev, [`speaker_image_${index}`]: "Only PNG, JPG, JPEG, and WebP images are allowed" }));
        e.target.value = "";
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setValidationErrors(prev => ({ ...prev, [`speaker_image_${index}`]: "Speaker image must be less than 2 MB" }));
        e.target.value = "";
        return;
      }
      setValidationErrors(prev => { const next = { ...prev }; delete next[`speaker_image_${index}`]; return next; });

      const newSpeakers = [...(formData.speakers || [])];
      newSpeakers[index] = { ...newSpeakers[index], image: file };
      setFormData({ ...formData, speakers: newSpeakers });

      const newPreviews = [...speakerImagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setSpeakerImagePreviews(newPreviews);
    }
  };

  const handleRemoveSpeakerImage = (index: number) => {
    const newSpeakers = [...(formData.speakers || [])];
    newSpeakers[index] = { ...newSpeakers[index], image: null };
    setFormData({ ...formData, speakers: newSpeakers });

    const newPreviews = [...speakerImagePreviews];
    newPreviews[index] = null;
    setSpeakerImagePreviews(newPreviews);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={event ? "Edit Event" : "Add Event"}
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
            boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.6)"
          }}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Success State */}
        {submitSuccess ? (
          <div className="space-y-4 max-h-[calc(80vh-140px)] overflow-y-auto pr-2 custom-scrollbar" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 transparent'
          }}>
            <div className="rounded-xl p-4" style={{ background: "rgba(79, 207, 165, 0.08)", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.5)" }}>
              <p className="text-sm text-emerald-800">
                Event <span className="font-semibold">{formData.title}</span> has been successfully{" "}
                {event ? "updated" : "added"}.
              </p>
            </div>

            <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
              borderTop: "1px solid rgba(0,0,0,0.06)",
              marginLeft: "-2px", marginRight: "-2px",
              paddingLeft: "2px", paddingRight: "2px"
            }}>
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form id="add-edit-event-form" onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar" style={{
              maxHeight: 'calc(80vh - 140px)',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 transparent'
            }}>
              {/* Error Message */}
              {submitError && (
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{
                  background: "#fee", border: "1px solid #fcc"
                }}>
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* Basic Details */}
              <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Basic Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (validationErrors.title) setValidationErrors({ ...validationErrors, title: "" });
                      }}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle(!!validationErrors.title)}
                      placeholder="Enter event title"
                      maxLength={60}
                    />
                    {validationErrors.title && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-xs text-red-600">{validationErrors.title}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => {
                        setFormData({ ...formData, event_type: e.target.value as EventType });
                        if (validationErrors.event_type) setValidationErrors({ ...validationErrors, event_type: "" });
                      }}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle(!!validationErrors.event_type)}
                    >
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    {validationErrors.event_type && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-xs text-red-600">{validationErrors.event_type}</p>
                      </div>
                    )}
                  </div>

                  {/* Specialization Searchable Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    <button
                      type="button"
                      className="w-full px-4 py-2.5 text-sm rounded-xl flex items-center justify-between gap-2 focus:ring-2 focus:ring-gray-900 focus:outline-none"
                      style={inputStyle()}
                      onClick={() => setIsSpecializationDropdownOpen(!isSpecializationDropdownOpen)}
                    >
                      <span className={formData.specialization ? "text-gray-900" : "text-gray-500"}>
                        {formData.specialization || "Select Specialization"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSpecializationDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isSpecializationDropdownOpen && (
                      <div
                        className="absolute z-50 w-full mt-1 bg-white rounded-xl overflow-hidden"
                        style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}
                      >
                        <div className="p-2 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                              style={inputStyle()}
                              placeholder="Search specializations..."
                              value={specializationSearch}
                              onChange={(e) => setSpecializationSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredSpecializations.length > 0 ? (
                            filteredSpecializations.map((spec) => (
                              <div
                                key={spec}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${formData.specialization === spec ? "bg-gray-50 font-medium" : ""}`}
                                onClick={() => handleSpecializationSelect(spec)}
                              >
                                {spec}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">No specializations found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <div className="relative">
                      <textarea
                        value={formData.description}
                        onChange={(e) => {
                          setFormData({ ...formData, description: e.target.value });
                          if (validationErrors.description) setValidationErrors({ ...validationErrors, description: "" });
                        }}
                        className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                        style={inputStyle(!!validationErrors.description)}
                        placeholder="Enter event description"
                        rows={3}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {formData.description.length}/500
                      </div>
                    </div>
                    {validationErrors.description && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-xs text-red-600">{validationErrors.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Date & Time</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => {
                        setFormData({ ...formData, start_date: e.target.value });
                        if (validationErrors.start_date) setValidationErrors({ ...validationErrors, start_date: "" });
                      }}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle(!!validationErrors.start_date)}
                    />
                    {validationErrors.start_date && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-xs text-red-600">{validationErrors.start_date}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => {
                        setFormData({ ...formData, end_date: e.target.value });
                        if (validationErrors.end_date) setValidationErrors({ ...validationErrors, end_date: "" });
                      }}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle(!!validationErrors.end_date)}
                    />
                    {validationErrors.end_date && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-xs text-red-600">{validationErrors.end_date}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                    <div className="flex gap-2">
                      <select
                        value={(() => {
                          if (!formData.start_time) return "";
                          const [h] = formData.start_time.split(":");
                          const hour = parseInt(h, 10);
                          if (hour === 0) return "12";
                          if (hour > 12) return String(hour - 12);
                          return String(hour);
                        })()}
                        onChange={(e) => {
                          const hour = parseInt(e.target.value, 10);
                          const [, min] = (formData.start_time || "00:00").split(":");
                          const currentH = parseInt((formData.start_time || "00:00").split(":")[0], 10);
                          const isPM = currentH >= 12;
                          let h24 = hour;
                          if (isPM && hour !== 12) h24 = hour + 12;
                          if (!isPM && hour === 12) h24 = 0;
                          const newTime = `${String(h24).padStart(2, "0")}:${min || "00"}`;
                          setFormData({ ...formData, start_time: newTime });
                          if (validationErrors.start_time) setValidationErrors({ ...validationErrors, start_time: "" });
                        }}
                        className="w-20 px-2 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none"
                        style={inputStyle(!!validationErrors.start_time)}
                      >
                        <option value="" disabled>HH</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <option key={h} value={String(h)}>{String(h).padStart(2, "0")}</option>
                        ))}
                      </select>
                      <select
                        value={formData.start_time ? formData.start_time.split(":")[1] : ""}
                        onChange={(e) => {
                          const [h] = (formData.start_time || "00:00").split(":");
                          const newTime = `${h || "00"}:${e.target.value}`;
                          setFormData({ ...formData, start_time: newTime });
                          if (validationErrors.start_time) setValidationErrors({ ...validationErrors, start_time: "" });
                        }}
                        className="w-20 px-2 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none"
                        style={inputStyle(!!validationErrors.start_time)}
                      >
                        <option value="" disabled>MM</option>
                        {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                          <option key={m} value={String(m).padStart(2, "0")}>{String(m).padStart(2, "0")}</option>
                        ))}
                      </select>
                      <select
                        value={(() => {
                          if (!formData.start_time) return "AM";
                          const hour = parseInt(formData.start_time.split(":")[0], 10);
                          return hour >= 12 ? "PM" : "AM";
                        })()}
                        onChange={(e) => {
                          const [hStr, min] = (formData.start_time || "12:00").split(":");
                          let hour = parseInt(hStr, 10);
                          if (e.target.value === "PM" && hour < 12) hour += 12;
                          if (e.target.value === "AM" && hour >= 12) hour -= 12;
                          const newTime = `${String(hour).padStart(2, "0")}:${min || "00"}`;
                          setFormData({ ...formData, start_time: newTime });
                          if (validationErrors.start_time) setValidationErrors({ ...validationErrors, start_time: "" });
                        }}
                        className="w-20 px-2 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none"
                        style={inputStyle(!!validationErrors.start_time)}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    {validationErrors.start_time && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-xs text-red-600">{validationErrors.start_time}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                    <div className="flex gap-2">
                      <select
                        value={(() => {
                          if (!formData.end_time) return "";
                          const [h] = formData.end_time.split(":");
                          const hour = parseInt(h, 10);
                          if (hour === 0) return "12";
                          if (hour > 12) return String(hour - 12);
                          return String(hour);
                        })()}
                        onChange={(e) => {
                          const hour = parseInt(e.target.value, 10);
                          const [, min] = (formData.end_time || "00:00").split(":");
                          const currentH = parseInt((formData.end_time || "00:00").split(":")[0], 10);
                          const isPM = currentH >= 12;
                          let h24 = hour;
                          if (isPM && hour !== 12) h24 = hour + 12;
                          if (!isPM && hour === 12) h24 = 0;
                          const newTime = `${String(h24).padStart(2, "0")}:${min || "00"}`;
                          setFormData({ ...formData, end_time: newTime });
                          if (validationErrors.end_time) setValidationErrors({ ...validationErrors, end_time: "" });
                        }}
                        className="w-20 px-2 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none"
                        style={inputStyle(!!validationErrors.end_time)}
                      >
                        <option value="" disabled>HH</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <option key={h} value={String(h)}>{String(h).padStart(2, "0")}</option>
                        ))}
                      </select>
                      <select
                        value={formData.end_time ? formData.end_time.split(":")[1] : ""}
                        onChange={(e) => {
                          const [h] = (formData.end_time || "00:00").split(":");
                          const newTime = `${h || "00"}:${e.target.value}`;
                          setFormData({ ...formData, end_time: newTime });
                          if (validationErrors.end_time) setValidationErrors({ ...validationErrors, end_time: "" });
                        }}
                        className="w-20 px-2 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none"
                        style={inputStyle(!!validationErrors.end_time)}
                      >
                        <option value="" disabled>MM</option>
                        {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                          <option key={m} value={String(m).padStart(2, "0")}>{String(m).padStart(2, "0")}</option>
                        ))}
                      </select>
                      <select
                        value={(() => {
                          if (!formData.end_time) return "AM";
                          const hour = parseInt(formData.end_time.split(":")[0], 10);
                          return hour >= 12 ? "PM" : "AM";
                        })()}
                        onChange={(e) => {
                          const [hStr, min] = (formData.end_time || "12:00").split(":");
                          let hour = parseInt(hStr, 10);
                          if (e.target.value === "PM" && hour < 12) hour += 12;
                          if (e.target.value === "AM" && hour >= 12) hour -= 12;
                          const newTime = `${String(hour).padStart(2, "0")}:${min || "00"}`;
                          setFormData({ ...formData, end_time: newTime });
                          if (validationErrors.end_time) setValidationErrors({ ...validationErrors, end_time: "" });
                        }}
                        className="w-20 px-2 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none"
                        style={inputStyle(!!validationErrors.end_time)}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    {validationErrors.end_time && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-xs text-red-600">{validationErrors.end_time}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Format & Location */}
              <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Format & Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Format *</label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value as EventFormat })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle()}
                    >
                      {EVENT_FORMATS.map((format) => (
                        <option key={format} value={format}>
                          {format.charAt(0).toUpperCase() + format.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(formData.format === "live" || formData.format === "hybrid") && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                      <input
                        type="text"
                        value={formData.venue}
                        onChange={(e) => {
                          setFormData({ ...formData, venue: e.target.value });
                          if (validationErrors.venue) setValidationErrors({ ...validationErrors, venue: "" });
                        }}
                        className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                        style={inputStyle(!!validationErrors.venue)}
                        placeholder="Enter venue address"
                        maxLength={100}
                      />
                      {validationErrors.venue && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          <p className="text-xs text-red-600">{validationErrors.venue}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Link *</label>
                    <input
                      type="url"
                      value={formData.event_link}
                      onChange={(e) => {
                        setFormData({ ...formData, event_link: e.target.value });
                        if (validationErrors.event_link) setValidationErrors({ ...validationErrors, event_link: "" });
                      }}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle(!!validationErrors.event_link)}
                      placeholder="https://example.com/event-registration"
                    />
                    {validationErrors.event_link && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-xs text-red-600">{validationErrors.event_link}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Registration & Credits */}
              <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Registration & Credits</h3>
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_free}
                      onChange={(e) => setFormData({ ...formData, is_free: e.target.checked, registration_fee: e.target.checked ? "0.00" : formData.registration_fee })}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
                    />
                    <span className="text-sm font-medium text-gray-700">Free Event</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_certificate_available}
                      onChange={(e) => setFormData({ ...formData, is_certificate_available: e.target.checked })}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
                    />
                    <span className="text-sm font-medium text-gray-700">Certificate Available</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Event</span>
                  </label>
                </div>
                {!formData.is_free && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.registration_fee}
                      onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle()}
                      min="0"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Agenda */}
              <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Agenda</h3>
                <div className="relative">
                  <textarea
                    value={formData.agenda}
                    onChange={(e) => {
                      setFormData({ ...formData, agenda: e.target.value });
                      if (validationErrors.agenda) setValidationErrors({ ...validationErrors, agenda: "" });
                    }}
                    className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                    style={inputStyle(!!validationErrors.agenda)}
                    placeholder="Enter event agenda (e.g., 9:00 AM - Registration, 10:00 AM - Session 1, etc.)"
                    rows={5}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {formData.agenda.length}/1000
                  </div>
                </div>
                {validationErrors.agenda && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <p className="text-xs text-red-600">{validationErrors.agenda}</p>
                  </div>
                )}
              </div>

              {/* Speakers */}
              <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <h3 className="text-sm font-semibold text-gray-900">Speakers</h3>
                  <button
                    type="button"
                    onClick={handleAddSpeaker}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-xl hover:opacity-90 transition-all"
                    style={{
                      background: "#1f2937",
                      boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Speaker
                  </button>
                </div>

                {formData.speakers && formData.speakers.length > 0 ? (
                  <div className="space-y-4">
                    {formData.speakers.map((speaker, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl space-y-3"
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-semibold text-gray-700">Speaker {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpeaker(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                            <input
                              type="text"
                              value={speaker.name}
                              onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                              style={inputStyle(!!validationErrors[`speaker_name_${index}`])}
                              placeholder="Dr. John Doe"
                              required
                              maxLength={50}
                            />
                            {validationErrors[`speaker_name_${index}`] && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                <p className="text-xs text-red-600">{validationErrors[`speaker_name_${index}`]}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                            <input
                              type="text"
                              value={speaker.title}
                              onChange={(e) => handleSpeakerChange(index, 'title', e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                              style={inputStyle(!!validationErrors[`speaker_title_${index}`])}
                              placeholder="Chief Cardiologist, AIIMS"
                              required
                              maxLength={50}
                            />
                            {validationErrors[`speaker_title_${index}`] && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                <p className="text-xs text-red-600">{validationErrors[`speaker_title_${index}`]}</p>
                              </div>
                            )}
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                            <div className="relative">
                              <textarea
                                value={speaker.bio || ""}
                                onChange={(e) => {
                                  if (e.target.value.length <= 500) {
                                    handleSpeakerChange(index, 'bio', e.target.value);
                                  }
                                }}
                                maxLength={500}
                                className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                                style={inputStyle()}
                                placeholder="Brief biography..."
                                rows={2}
                              />
                              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                {(speaker.bio || "").length}/500
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Speaker Image</label>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.webp"
                              onChange={(e) => handleSpeakerImageUpload(index, e)}
                              className="hidden"
                              id={`speaker-image-${index}`}
                            />
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.webp"
                              onChange={(e) => handleSpeakerImageUpload(index, e)}
                              className="hidden"
                              id={`speaker-image-replace-${index}`}
                            />

                            {speakerImagePreviews[index] ? (
                              <div className="mt-1 flex items-start gap-3">
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0" style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)" }}>
                                  <img
                                    src={speakerImagePreviews[index]?.startsWith('http') || speakerImagePreviews[index]?.startsWith('blob:')
                                      ? speakerImagePreviews[index]!
                                      : BackendBaseURL + speakerImagePreviews[index]}
                                    alt={`${speaker.name}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex flex-col gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`speaker-image-replace-${index}`)?.click()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                                    style={{
                                      background: "#f8f9fb",
                                      border: "1px solid #e5e7eb",
                                      boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.04)",
                                    }}
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    Replace
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSpeakerImage(index)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all"
                                    style={{
                                      background: "#fff5f5",
                                      border: "1px solid #fecaca",
                                      boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.04)",
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => document.getElementById(`speaker-image-${index}`)?.click()}
                                className="w-full px-4 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-sm text-gray-500 transition-all hover:text-gray-700 hover:border-gray-300"
                                style={{
                                  background: "#ffffff",
                                  border: "2px dashed rgba(0,0,0,0.12)",
                                  boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                                }}
                              >
                                <Upload className="w-4 h-4" />
                                <span>Upload Speaker Image</span>
                                <span className="text-[10px] text-gray-400">PNG, JPG, JPEG, WebP · Max 2 MB</span>
                              </button>
                            )}

                            {validationErrors[`speaker_image_${index}`] && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                <p className="text-xs text-red-600">{validationErrors[`speaker_image_${index}`]}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No speakers added yet. Click "Add Speaker" to add speakers.
                  </p>
                )}
              </div>

              {/* Event Images */}
              <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <h3 className="text-sm font-semibold text-gray-900">Event Images</h3>
                  <span className="text-xs text-gray-400">{imagePreviews.length}/{MAX_EVENT_IMAGES} images</span>
                </div>
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {imagePreviews.length < MAX_EVENT_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-4 rounded-xl flex flex-col items-center justify-center gap-1.5 text-sm text-gray-500 transition-all hover:text-gray-700 hover:border-gray-300"
                      style={{
                        background: "#ffffff",
                        border: "2px dashed rgba(0,0,0,0.12)",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <Upload className="w-5 h-5" />
                      <span>Click to upload images</span>
                      <span className="text-[10px] text-gray-400">PNG, JPG, JPEG, WebP · Max 2 MB each · Up to {MAX_EVENT_IMAGES} images</span>
                    </button>
                  )}

                  {validationErrors.images && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      <p className="text-xs text-red-600">{validationErrors.images}</p>
                    </div>
                  )}

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden group"
                          style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)" }}
                        >
                          <img
                            src={preview.startsWith('http') || preview.startsWith('blob:')
                              ? preview
                              : BackendBaseURL + preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay with action buttons */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.webp"
                              onChange={(e) => handleReplaceImage(index, e)}
                              className="hidden"
                              id={`event-image-replace-${index}`}
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById(`event-image-replace-${index}`)?.click()}
                              className="p-1.5 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-all" title="Replace image"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-all" title="Delete image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {/* Image index badge */}
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/50 text-white text-[10px] font-medium rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
              borderTop: "1px solid rgba(0,0,0,0.06)",
              marginLeft: "-2px", marginRight: "-2px",
              paddingLeft: "2px", paddingRight: "2px"
            }}>
              <button
                type="submit"
                form="add-edit-event-form"
                disabled={isSubmitting}
                className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{event ? "Updating..." : "Adding..."}</span>
                  </>
                ) : (
                  <span>{event ? "Update Event" : "Add Event"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}