import { useState, useEffect, useRef } from "react";
import type { Event, CreateEventDTO, EventType, EventFormat, SpeakerFormData } from "../event.types";
import { EVENT_TYPES, EVENT_FORMATS, SPECIALIZATIONS } from "../event.types";
import { ChevronDown, Search, AlertCircle, X, Upload, XCircle, Plus, Trash2 } from "lucide-react";

interface AddEditEventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEventDTO) => Promise<{ error?: string }>;
}

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children, size = "lg" }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black/50"></div>

        <div className={`relative inline-block w-full ${size === "lg" ? "max-w-4xl" : "max-w-2xl"} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg`}>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

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
        title: event.title,
        description: event.description,
        event_type: event.event_type,
        specialization: event.specialization,
        start_date: event.start_date,
        end_date: event.end_date,
        start_time: event.start_time,
        end_time: event.end_time,
        format: event.format,
        is_free: event.is_free,
        registration_fee: event.registration_fee,
        is_certificate_available: event.is_certificate_available,
        agenda: event.agenda,
        venue: event.venue,
        event_link: event.event_link,
        is_featured: event.is_featured,
        images: [],
        speakers: event.speakers?.map(speaker => ({
          name: speaker.name,
          title: speaker.title,
          bio: speaker.bio || "",
          image: null,
        })) || [],
      });
      // Set existing image previews
      if (event.images && event.images.length > 0) {
        setImagePreviews(event.images.map(img => img.image));
      }
      // Set existing speaker image previews
      if (event.speakers && event.speakers.length > 0) {
        setSpeakerImagePreviews(event.speakers.map(speaker => speaker.image || null));
      }
    } else {
      setFormData(initialFormData);
      setImagePreviews([]);
      setSpeakerImagePreviews([]);
    }
    // Reset submission and validation states when modal opens/closes
    setSubmitSuccess(false);
    setSubmitError(null);
    setValidationErrors({});
  }, [event, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSpecializationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter specializations based on search
  const filteredSpecializations = SPECIALIZATIONS.filter((spec) =>
    spec.toLowerCase().includes(specializationSearch.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData({ ...formData, images: files });

      // Create previews
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

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Title is required
    if (!formData.title.trim()) {
      errors.title = "Event title is required";
    }

    // Event type is required (has default, but just in case)
    if (!formData.event_type) {
      errors.event_type = "Event type is required";
    }

    // Start date is required
    if (!formData.start_date) {
      errors.start_date = "Start date is required";
    }

    // End date is required
    if (!formData.end_date) {
      errors.end_date = "End date is required";
    }

    // Start time is required
    if (!formData.start_time) {
      errors.start_time = "Start time is required";
    }

    // End time is required
    if (!formData.end_time) {
      errors.end_time = "End time is required";
    }

    // Date validation: end date should not be before start date
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.end_date = "End date cannot be before start date";
    }


    // Event link is always required (official registration website)
    if (!formData.event_link?.trim()) {
      errors.event_link = "Event link is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await onSubmit(formData);

      if (result.error) {
        setSubmitError(result.error);
      } else {
        setSubmitSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={event ? "Edit Event" : "Add Event"}
      size="lg"
    >
      {/* Success State */}
      {submitSuccess ? (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-800">
              Event <span className="font-semibold">{formData.title}</span> has been successfully {event ? "updated" : "added"}.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        /* Form State */
        <div className="space-y-6">
          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            </div>
          )}

          {/* Basic Details */}
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Basic Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (validationErrors.title) setValidationErrors({ ...validationErrors, title: "" });
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.title ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter event title"
                />
                {validationErrors.title && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type *
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => {
                    setFormData({ ...formData, event_type: e.target.value as EventType });
                    if (validationErrors.event_type) setValidationErrors({ ...validationErrors, event_type: "" });
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.event_type ? "border-red-500" : "border-gray-300"}`}
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                {validationErrors.event_type && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.event_type}</p>
                )}
              </div>

              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <div
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent bg-white cursor-pointer"
                  onClick={() => setIsSpecializationDropdownOpen(!isSpecializationDropdownOpen)}
                >
                  <div className="flex items-center justify-between">
                    <span className={formData.specialization ? "text-gray-900" : "text-gray-500"}>
                      {formData.specialization || "Select Specialization"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSpecializationDropdownOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {isSpecializationDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${formData.specialization === spec ? "bg-gray-50 font-medium" : ""
                              }`}
                            onClick={() => handleSpecializationSelect(spec)}
                          >
                            {spec}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                          No specializations found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Date & Time
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => {
                    setFormData({ ...formData, start_date: e.target.value });
                    if (validationErrors.start_date) setValidationErrors({ ...validationErrors, start_date: "" });
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.start_date ? "border-red-500" : "border-gray-300"}`}
                />
                {validationErrors.start_date && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.start_date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => {
                    setFormData({ ...formData, end_date: e.target.value });
                    if (validationErrors.end_date) setValidationErrors({ ...validationErrors, end_date: "" });
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.end_date ? "border-red-500" : "border-gray-300"}`}
                />
                {validationErrors.end_date && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.end_date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
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
                    className={`w-20 px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.start_time ? "border-red-500" : "border-gray-300"}`}
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
                    className={`w-20 px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.start_time ? "border-red-500" : "border-gray-300"}`}
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
                    className={`w-20 px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.start_time ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                {validationErrors.start_time && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.start_time}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
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
                    className={`w-20 px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.end_time ? "border-red-500" : "border-gray-300"}`}
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
                    className={`w-20 px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.end_time ? "border-red-500" : "border-gray-300"}`}
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
                    className={`w-20 px-2 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.end_time ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                {validationErrors.end_time && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.end_time}</p>
                )}
              </div>
            </div>
          </div>

          {/* Event Format & Location */}
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Format & Location
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Format *
                </label>
                <select
                  value={formData.format}
                  onChange={(e) => {
                    setFormData({ ...formData, format: e.target.value as EventFormat });
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter venue address"
                  />
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Link *
                </label>
                <input
                  type="url"
                  value={formData.event_link}
                  onChange={(e) => {
                    setFormData({ ...formData, event_link: e.target.value });
                    if (validationErrors.event_link) setValidationErrors({ ...validationErrors, event_link: "" });
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${validationErrors.event_link ? "border-red-500" : "border-gray-300"}`}
                  placeholder="https://example.com/event-registration"
                />
                {validationErrors.event_link && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.event_link}</p>
                )}
              </div>
            </div>
          </div>

          {/* Registration & Credits */}
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Registration & Credits
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={formData.is_free}
                    onChange={(e) => setFormData({ ...formData, is_free: e.target.checked, registration_fee: e.target.checked ? "0.00" : formData.registration_fee })}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
                  />
                  <label htmlFor="is_free" className="text-sm font-medium text-gray-700">
                    Free Event
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="certificate_available"
                    checked={formData.is_certificate_available}
                    onChange={(e) => setFormData({ ...formData, is_certificate_available: e.target.checked })}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
                  />
                  <label htmlFor="certificate_available" className="text-sm font-medium text-gray-700">
                    Certificate Available
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                    Featured Event
                  </label>
                </div>
              </div>
              {!formData.is_free && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Fee (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.registration_fee}
                    onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Agenda */}
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Agenda
            </h3>
            <textarea
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter event agenda (e.g., 9:00 AM - Registration, 10:00 AM - Session 1, etc.)"
              rows={5}
            />
          </div>

          {/* Speakers */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Speakers
              </h3>
              <button
                type="button"
                onClick={handleAddSpeaker}
                className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Speaker
              </button>
            </div>

            {formData.speakers && formData.speakers.length > 0 ? (
              <div className="space-y-4">
                {formData.speakers.map((speaker, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Speaker {index + 1}</h4>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={speaker.name}
                          onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="Dr. John Doe"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={speaker.title}
                          onChange={(e) => handleSpeakerChange(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="Chief Cardiologist, AIIMS"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          value={speaker.bio || ""}
                          onChange={(e) => handleSpeakerChange(index, 'bio', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          placeholder="Brief biography..."
                          rows={2}
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Speaker Image
                        </label>
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
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Speaker Image
                        </button>

                        {speakerImagePreviews[index] && (
                          <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
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
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Event Images
            </h3>
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
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600"
              >
                <Upload className="w-5 h-5" />
                Upload Images
              </button>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 p-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{event ? "Updating..." : "Adding..."}</span>
                </>
              ) : (
                <span>{event ? "Update Event" : "Add Event"}</span>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}