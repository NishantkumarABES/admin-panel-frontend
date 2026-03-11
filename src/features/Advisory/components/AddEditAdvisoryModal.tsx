import { useState, useEffect } from "react";
import type { AdvisoryMember, CreateAdvisoryDTO } from "../advisory.types";
import type { DoctorUser } from "../../doctors/doctor.types";
import Modal from "../../../components/common/Modal";
import { Search, Upload, X, AlertCircle } from "lucide-react";
import { getDoctors } from "../../../services/doctor.service";
import { SPECIALTIES } from "../advisory.types";

interface AddEditAdvisoryModalProps {
  member: AdvisoryMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateAdvisoryDTO | { doctorId: string },
    isFromDoctor: boolean
  ) => Promise<{ error?: string }>;
}

const initialFormData: CreateAdvisoryDTO = {
  full_name: "",
  gender: "",
  date_of_birth: "",
  email: "",
  phone: "",
  specialization: "",
  years_of_experience: 0,
  bio: "",
  status: "active",
};

const MAX_CHARS_BIO = 1000;
const MAX_CHARS_EMAIL = 254;
const MAX_CHARS_NAME = 50;
const MAX_CHARS_PHONE = 15;
const MAX_EXPERIENCE = 65;

const inputStyle = (hasError = false) => ({
  background: "#ffffff",
  border: hasError ? "1px solid #ef4444" : "1px solid #e5e7eb",
  boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
});

const sectionStyle = {
  background: "#f8f9fb",
  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
};

export default function AddEditAdvisoryModal({
  member,
  isOpen,
  onClose,
  onSubmit,
}: AddEditAdvisoryModalProps) {
  const [mode, setMode] = useState<"manual" | "select-doctor">("manual");
  const [formData, setFormData] = useState<CreateAdvisoryDTO>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Doctor selection states
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorUser | null>(null);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
    if (member) {
      setFormData({
        full_name: member.full_name,
        gender: member.gender || "",
        date_of_birth: member.date_of_birth || "",
        email: member.email,
        phone: member.phone,
        specialization: member.specialization,
        years_of_experience: member.years_of_experience,
        bio: member.bio || "",
        status: member.status,
      });
      setImagePreview(member.image || null);
    } else {
      setFormData(initialFormData);
      setImagePreview(null);
    }
    setImageFile(null);
    setSubmitSuccess(false);
    setSubmitError(null);
    setMode("manual");
    setSelectedDoctor(null);
    setDoctorSearch("");
  }, [member, isOpen]);

  useEffect(() => {
    if (mode === "select-doctor" && !member && doctors.length === 0) {
      fetchDoctors();
    }
  }, [mode]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await getDoctors({
        page: 1,
        page_size: 100,
        search: doctorSearch || undefined,
      });
      setDoctors(response.data.results);
    } catch (error) {
      console.error("Failed to load doctors:", error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate character limits
    const errors: Record<string, string> = {};
    if (formData.full_name.length > MAX_CHARS_NAME) {
      errors.full_name = `Full Name cannot exceed ${MAX_CHARS_NAME} characters`;
    }
    if (formData.phone.length > MAX_CHARS_PHONE) {
      errors.phone = `Phone cannot exceed ${MAX_CHARS_PHONE} characters`;
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let submitData: CreateAdvisoryDTO | { doctorId: string };
      let isFromDoctor = false;

      if (mode === "select-doctor" && selectedDoctor) {
        submitData = { doctorId: selectedDoctor.id };
        isFromDoctor = true;
      } else {
        submitData = { ...formData };
        if (imageFile) {
          submitData.image = imageFile;
        }
      }

      const result = await onSubmit(submitData, isFromDoctor);

      if (result.error) {
        setSubmitError(result.error);
      } else {
        setSubmitSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (error: any) {
      setSubmitError(
        error?.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview(null);
    setSubmitSuccess(false);
    setSubmitError(null);
    setValidationErrors({});
    setMode("manual");
    setSelectedDoctor(null);
    setDoctorSearch("");
    onClose();
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.full_name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doctor.email.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doctor.doctor_profile.specialization.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const renderCharCounter = (text: string, max: number) => (
    <div className="text-xs text-right text-gray-500 mt-1">
      {text.length}/{max}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={member ? "Edit Advisory Member" : "Add Advisory Member"}
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
                Advisory member has been successfully {member ? "updated" : "added"}.
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
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar" style={{
              maxHeight: 'calc(80vh - 140px)',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 transparent'
            }}>
              {/* Submit Error */}
              {submitError && (
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{
                  background: "#fee", border: "1px solid #fcc"
                }}>
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* Mode Switcher (Add mode only) */}
              {!member && (
                <div className="flex rounded-xl p-1" style={{ background: "#f1f3f7", boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.06)" }}>
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${mode === "manual"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    Add Manually
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("select-doctor")}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${mode === "select-doctor"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    Select Doctor
                  </button>
                </div>
              )}

              {mode === "select-doctor" && !member ? (
                <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    Search Registered Doctors
                  </h3>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      className="w-full pl-9 px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle()}
                      placeholder="Search by name, email, or specialization..."
                    />
                  </div>

                  <div
                    className="rounded-xl max-h-77 overflow-y-auto custom-scrollbar"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    {loadingDoctors ? (
                      <div className="p-8 text-center text-gray-500">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-2" />
                        Loading doctors...
                      </div>
                    ) : filteredDoctors.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No doctors found
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {filteredDoctors.map((doctor) => (
                          <div
                            key={doctor.id}
                            onClick={() => setSelectedDoctor(doctor)}
                            className={`p-3 cursor-pointer transition-all ${selectedDoctor?.id === doctor.id
                              ? "bg-gray-50"
                              : "hover:bg-gray-50/60"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                checked={selectedDoctor?.id === doctor.id}
                                onChange={() => setSelectedDoctor(doctor)}
                                className="w-4 h-4 text-gray-900"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  Dr. {doctor.full_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {doctor.doctor_profile.specialization} • {doctor.doctor_profile.years_of_experience} years
                                </div>
                                <div className="text-xs text-gray-500">
                                  {doctor.email}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Image Upload */}
                  <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      Profile Image
                    </h3>
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 rounded-xl object-cover"
                          style={{
                            boxShadow: "2px 2px 6px rgba(0, 0, 0, 0.06), -2px -2px 6px rgba(255, 255, 255, 0.8)",
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 p-1 text-white rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                        style={{
                          background: "#ffffff",
                          border: "2px dashed rgba(0,0,0,0.12)",
                          boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          Click to upload image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          maxLength={MAX_CHARS_NAME}
                          value={formData.full_name}
                          onChange={(e) => {
                            setFormData({ ...formData, full_name: e.target.value });
                            if (validationErrors.full_name) setValidationErrors({ ...validationErrors, full_name: "" });
                          }}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle(!!validationErrors.full_name)}
                          placeholder="Enter full name"
                          required
                        />
                        {validationErrors.full_name && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            <p className="text-xs text-red-600">{validationErrors.full_name}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                          <input
                            type="email"
                            maxLength={MAX_CHARS_EMAIL}
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                            style={inputStyle()}
                            placeholder="Enter email"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                          <input
                            type="tel"
                            maxLength={MAX_CHARS_PHONE}
                            value={formData.phone}
                            onChange={(e) => {
                              setFormData({ ...formData, phone: e.target.value });
                              if (validationErrors.phone) setValidationErrors({ ...validationErrors, phone: "" });
                            }}
                            className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                            style={inputStyle(!!validationErrors.phone)}
                            placeholder="Enter phone number"
                            required
                          />
                          {validationErrors.phone && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                              <p className="text-xs text-red-600">{validationErrors.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                          <select
                            value={formData.gender}
                            onChange={(e) =>
                              setFormData({ ...formData, gender: e.target.value })
                            }
                            className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                            style={inputStyle()}
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                          <input
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) =>
                              setFormData({ ...formData, date_of_birth: e.target.value })
                            }
                            className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                            style={inputStyle()}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      Professional Details
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
                          <select
                            value={formData.specialization}
                            onChange={(e) =>
                              setFormData({ ...formData, specialization: e.target.value })
                            }
                            className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                            style={inputStyle()}
                            required
                          >
                            <option value="">Select Specialization</option>
                            {SPECIALTIES.map((specialty) => (
                              <option key={specialty} value={specialty}>
                                {specialty}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                          <input
                            type="number"
                            value={formData.years_of_experience}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              if (val <= MAX_EXPERIENCE) {
                                setFormData({
                                  ...formData,
                                  years_of_experience: val,
                                });
                              }
                            }}
                            className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                            style={inputStyle()}
                            placeholder="Enter years"
                            min="1"
                            max={MAX_EXPERIENCE}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                          value={formData.bio}
                          maxLength={MAX_CHARS_BIO}
                          onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                          }
                          rows={4}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all resize-none"
                          style={inputStyle()}
                          placeholder="Enter a brief bio..."
                        />
                        {renderCharCounter(formData.bio || "", MAX_CHARS_BIO)}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as "active" | "inactive",
                            })
                          }
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle()}
                          required
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
              borderTop: "1px solid rgba(0,0,0,0.06)",
              marginLeft: "-2px", marginRight: "-2px",
              paddingLeft: "2px", paddingRight: "2px"
            }}>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  (mode === "select-doctor" && !selectedDoctor && !member)
                }
                className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{member ? "Updating..." : "Adding..."}</span>
                  </>
                ) : (
                  <span>{member ? "Update Member" : "Add Member"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
