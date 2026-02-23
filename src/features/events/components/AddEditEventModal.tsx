import { useState, useEffect, useRef } from "react";
import type { Event, CreateEventDTO, EventType, EventFormat, SpeakerFormData } from "../event.types";
import { EVENT_TYPES, EVENT_FORMATS, SPECIALIZATIONS } from "../event.types";
import { ChevronDown, Search, AlertCircle, X, Upload, Plus, Trash2 } from "lucide-react";

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

const insetStyle = {
  background: "#eff1f5",
  border: "none",
  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
};

const insetErrorStyle = {
  background: "#eff1f5",
  border: "1px solid rgba(255, 112, 112, 0.6)",
  boxShadow: "inset 2px 2px 5px rgba(255, 80, 80, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.4)",
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
        setImagePreviews(event.images.map(img => img.image));
      }
      if (event.speakers && event.speakers.length > 0) {
        setSpeakerImagePreviews(event.speakers.map(speaker => speaker.image || null));
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData({ ...formData, images: files });
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
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
    } else if (formData.title.length > 150) {
      errors.title = "Event title must be less than 150 characters";
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
    if (formData.venue && formData.venue.length > 255) {
      errors.venue = "Venue must be less than 255 characters";
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
  };

  const handleSpeakerImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-[18px] w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Header */}
          <div
            className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {event ? "Edit Event" : "Add Event"}
            </h2>
          </div>

          {/* Scrollable Body */}
          <div className="px-6 py-4">
            {/* Success State */}
            {submitSuccess ? (
              <div className="rounded-xl p-4" style={{ background: "rgba(79, 207, 165, 0.08)", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.5)" }}>
                <p className="text-sm text-emerald-800">
                  Event <span className="font-semibold">{formData.title}</span> has been successfully{" "}
                  {event ? "updated" : "added"}.
                </p>
              </div>
            ) : (
              <form id="add-edit-event-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Error Message */}
                {submitError && (
                  <div
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{
                      background: "rgba(255, 112, 112, 0.07)",
                      boxShadow: "inset 2px 2px 5px rgba(255,80,80,0.06), inset -2px -2px 5px rgba(255,255,255,0.5)",
                    }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}

                {/* Basic Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Event Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({ ...formData, title: e.target.value });
                          if (validationErrors.title) setValidationErrors({ ...validationErrors, title: "" });
                        }}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={validationErrors.title ? insetErrorStyle : insetStyle}
                        placeholder="Enter event title"
                      />
                      {validationErrors.title && <p className="text-xs text-red-500 mt-1">{validationErrors.title}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Event Type *</label>
                      <select
                        value={formData.event_type}
                        onChange={(e) => {
                          setFormData({ ...formData, event_type: e.target.value as EventType });
                          if (validationErrors.event_type) setValidationErrors({ ...validationErrors, event_type: "" });
                        }}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={validationErrors.event_type ? insetErrorStyle : insetStyle}
                      >
                        {EVENT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                      {validationErrors.event_type && <p className="text-xs text-red-500 mt-1">{validationErrors.event_type}</p>}
                    </div>

                    {/* Specialization Searchable Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Specialization</label>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-sm rounded-xl flex items-center justify-between gap-2 focus:ring-2 focus:ring-gray-900 focus:outline-none"
                        style={insetStyle}
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
                          style={{ boxShadow: "6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.7)" }}
                        >
                          <div className="p-2 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm"
                                style={{ background: "#eff1f5", border: "none", boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.5)" }}
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <div className="relative">
                        <textarea
                          value={formData.description}
                          onChange={(e) => {
                            setFormData({ ...formData, description: e.target.value });
                            if (validationErrors.description) setValidationErrors({ ...validationErrors, description: "" });
                          }}
                          className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          style={validationErrors.description ? insetErrorStyle : insetStyle}
                          placeholder="Enter event description"
                          rows={3}
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                          {formData.description.length}/500
                        </div>
                      </div>
                      {validationErrors.description && <p className="text-xs text-red-500 mt-1">{validationErrors.description}</p>}
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Date & Time</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Date *</label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => {
                          setFormData({ ...formData, start_date: e.target.value });
                          if (validationErrors.start_date) setValidationErrors({ ...validationErrors, start_date: "" });
                        }}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={validationErrors.start_date ? insetErrorStyle : insetStyle}
                      />
                      {validationErrors.start_date && <p className="text-xs text-red-500 mt-1">{validationErrors.start_date}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Date *</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => {
                          setFormData({ ...formData, end_date: e.target.value });
                          if (validationErrors.end_date) setValidationErrors({ ...validationErrors, end_date: "" });
                        }}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={validationErrors.end_date ? insetErrorStyle : insetStyle}
                      />
                      {validationErrors.end_date && <p className="text-xs text-red-500 mt-1">{validationErrors.end_date}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Time *</label>
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
                          className="w-20 px-2 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          style={validationErrors.start_time ? insetErrorStyle : insetStyle}
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
                          className="w-20 px-2 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          style={validationErrors.start_time ? insetErrorStyle : insetStyle}
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
                          className="w-20 px-2 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          style={validationErrors.start_time ? insetErrorStyle : insetStyle}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                      {validationErrors.start_time && <p className="text-xs text-red-500 mt-1">{validationErrors.start_time}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Time *</label>
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
                          className="w-20 px-2 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          style={validationErrors.end_time ? insetErrorStyle : insetStyle}
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
                          className="w-20 px-2 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          style={validationErrors.end_time ? insetErrorStyle : insetStyle}
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
                          className="w-20 px-2 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          style={validationErrors.end_time ? insetErrorStyle : insetStyle}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                      {validationErrors.end_time && <p className="text-xs text-red-500 mt-1">{validationErrors.end_time}</p>}
                    </div>
                  </div>
                </div>

                {/* Format & Location */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Format & Location</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Event Format *</label>
                      <select
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value as EventFormat })}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={insetStyle}
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
                        <label className="block text-xs font-medium text-gray-600 mb-1">Venue</label>
                        <input
                          type="text"
                          value={formData.venue}
                          onChange={(e) => {
                            setFormData({ ...formData, venue: e.target.value });
                            if (validationErrors.venue) setValidationErrors({ ...validationErrors, venue: "" });
                          }}
                          className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          style={validationErrors.venue ? insetErrorStyle : insetStyle}
                          placeholder="Enter venue address"
                        />
                        {validationErrors.venue && <p className="text-xs text-red-500 mt-1">{validationErrors.venue}</p>}
                      </div>
                    )}

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Event Link *</label>
                      <input
                        type="url"
                        value={formData.event_link}
                        onChange={(e) => {
                          setFormData({ ...formData, event_link: e.target.value });
                          if (validationErrors.event_link) setValidationErrors({ ...validationErrors, event_link: "" });
                        }}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={validationErrors.event_link ? insetErrorStyle : insetStyle}
                        placeholder="https://example.com/event-registration"
                      />
                      {validationErrors.event_link && <p className="text-xs text-red-500 mt-1">{validationErrors.event_link}</p>}
                    </div>
                  </div>
                </div>

                {/* Registration & Credits */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Registration & Credits</h3>
                  <div className="flex gap-6 mb-3">
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">Registration Fee (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.registration_fee}
                        onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        style={insetStyle}
                        min="0"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Agenda */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Agenda</h3>
                  <div className="relative">
                    <textarea
                      value={formData.agenda}
                      onChange={(e) => {
                        setFormData({ ...formData, agenda: e.target.value });
                        if (validationErrors.agenda) setValidationErrors({ ...validationErrors, agenda: "" });
                      }}
                      className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      style={validationErrors.agenda ? insetErrorStyle : insetStyle}
                      placeholder="Enter event agenda (e.g., 9:00 AM - Registration, 10:00 AM - Session 1, etc.)"
                      rows={5}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                      {formData.agenda.length}/1000
                    </div>
                  </div>
                  {validationErrors.agenda && <p className="text-xs text-red-500 mt-1">{validationErrors.agenda}</p>}
                </div>

                {/* Speakers */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Speakers</h3>
                    <button
                      type="button"
                      onClick={handleAddSpeaker}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                      style={{
                        background: "#1f2937",
                        boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                      }}
                    >
                      <Plus className="w-4 h-4" />
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
                            background: "#f8f9fb",
                            boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.6)",
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-gray-700">Speaker {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpeaker(index)}
                              className="text-red-600 hover:text-red-700 transition-colors"
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
                                className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                style={insetStyle}
                                placeholder="Dr. John Doe"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                              <input
                                type="text"
                                value={speaker.title}
                                onChange={(e) => handleSpeakerChange(index, 'title', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                style={insetStyle}
                                placeholder="Chief Cardiologist, AIIMS"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                              <textarea
                                value={speaker.bio || ""}
                                onChange={(e) => handleSpeakerChange(index, 'bio', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                style={insetStyle}
                                placeholder="Brief biography..."
                                rows={2}
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Speaker Image</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSpeakerImageUpload(index, e)}
                                className="hidden"
                                id={`speaker-image-${index}`}
                              />
                              <button
                                type="button"
                                onClick={() => document.getElementById(`speaker-image-${index}`)?.click()}
                                className="w-full px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-500 transition-all hover:text-gray-700"
                                style={{
                                  background: "#eff1f5",
                                  border: "2px dashed rgba(0,0,0,0.12)",
                                  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.5)",
                                }}
                              >
                                <Upload className="w-4 h-4" />
                                Upload Speaker Image
                              </button>

                              {speakerImagePreviews[index] && (
                                <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden group" style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)" }}>
                                  <img
                                    src={speakerImagePreviews[index]?.startsWith('http') || speakerImagePreviews[index]?.startsWith('blob:')
                                      ? speakerImagePreviews[index]!
                                      : BackendBaseURL + speakerImagePreviews[index]}
                                    alt={`${speaker.name}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSpeakerImage(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
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
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Event Images</h3>
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-500 transition-all hover:text-gray-700"
                      style={{
                        background: "#eff1f5",
                        border: "2px dashed rgba(0,0,0,0.12)",
                        boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.5)",
                      }}
                    >
                      <Upload className="w-5 h-5" />
                      Upload Images
                    </button>

                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden group"
                            style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.8)" }}
                          >
                            <img
                              src={BackendBaseURL + preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Sticky Footer */}
          <div
            className="flex items-center justify-end gap-3 px-6 py-4 sticky bottom-0 bg-white"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
            {submitSuccess ? (
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                }}
              >
                Done
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="clay-btn disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: "13px", padding: "6px 16px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-edit-event-form"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "#1f2937",
                    boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}