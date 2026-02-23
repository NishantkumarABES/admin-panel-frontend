import { useState, useEffect } from "react";
import type { AdvisoryMember, CreateAdvisoryDTO } from "../advisory.types";
import type { DoctorUser } from "../../doctors/doctor.types";
import Modal from "../../../components/common/Modal";
import { Search, Upload, X, AlertCircle } from "lucide-react";
import { getDoctors } from "../../../services/doctor.service";
import { SPECIALTIES } from "../../Advertisements/advertisement.types";

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
const MAX_CHARS_NAME = 255;
const MAX_CHARS_PHONE = 15;
const MAX_EXPERIENCE = 65;

const clayInputClass = "w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent";
const clayInputStyle = {
  background: "#eff1f5",
  border: "none",
  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
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
      size="lg"
    >
      {submitSuccess ? (
        <div className="space-y-4">
          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(79, 207, 165, 0.08)",
              boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.04), inset -2px -2px 4px rgba(255, 255, 255, 0.5)",
            }}
          >
            <p className="text-sm" style={{ color: "#2d8a6e" }}>
              Advisory member has been successfully {member ? "updated" : "added"}.
            </p>
          </div>

          <div className="flex justify-end pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
              style={{
                background: "#1f2937",
                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
              }}
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{
                background: "rgba(255, 112, 112, 0.06)",
                boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.04), inset -2px -2px 4px rgba(255, 255, 255, 0.5)",
              }}
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#ff7070" }} />
              <div className="flex-1">
                <p className="text-sm" style={{ color: "#c53030" }}>{submitError}</p>
              </div>
            </div>
          )}

          {!member && (
            <div
              className="flex gap-1 p-1 rounded-xl"
              style={{
                background: "#eff1f5",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)",
              }}
            >
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${mode === "manual"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                style={mode === "manual" ? {
                  background: "#ffffff",
                  boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.08), -3px -3px 6px rgba(255, 255, 255, 0.7)",
                } : {}}
              >
                Add Manually
              </button>
              <button
                type="button"
                onClick={() => setMode("select-doctor")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${mode === "select-doctor"
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                style={mode === "select-doctor" ? {
                  background: "#ffffff",
                  boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.08), -3px -3px 6px rgba(255, 255, 255, 0.7)",
                } : {}}
              >
                Select Doctor
              </button>
            </div>
          )}

          {mode === "select-doctor" && !member ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Registered Doctors
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className={`${clayInputClass} pl-9`}
                    style={clayInputStyle}
                    placeholder="Search by name, email, or specialization..."
                  />
                </div>
              </div>

              <div
                className="rounded-xl max-h-77 overflow-y-auto"
                style={{
                  background: "#f8f9fb",
                  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)",
                }}
              >
                {loadingDoctors ? (
                  <div className="p-8 text-center text-gray-500">
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
                          ? "bg-white/70"
                          : "hover:bg-white/40"
                          }`}
                        style={selectedDoctor?.id === doctor.id ? {
                          boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.04), inset -2px -2px 4px rgba(255, 255, 255, 0.5)",
                        } : {}}
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
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-xl object-cover"
                      style={{
                        boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.08), -4px -4px 8px rgba(255, 255, 255, 0.7)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 p-1 text-white rounded-full"
                      style={{
                        background: "#ff7070",
                        boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.12)",
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all hover:bg-gray-100/50"
                    style={{
                      background: "#f8f9fb",
                      border: "2px dashed rgba(0,0,0,0.12)",
                      boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.5)",
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

              {/* Form Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  maxLength={MAX_CHARS_NAME}
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className={clayInputClass}
                  style={clayInputStyle}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    maxLength={MAX_CHARS_EMAIL}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={clayInputClass}
                    style={clayInputStyle}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    maxLength={MAX_CHARS_PHONE}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={clayInputClass}
                    style={clayInputStyle}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className={clayInputClass}
                    style={clayInputStyle}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      setFormData({ ...formData, date_of_birth: e.target.value })
                    }
                    className={clayInputClass}
                    style={clayInputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization *
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({ ...formData, specialization: e.target.value })
                    }
                    className={clayInputClass}
                    style={clayInputStyle}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience *
                  </label>
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
                    className={clayInputClass}
                    style={clayInputStyle}
                    placeholder="Enter years"
                    min="1"
                    max={MAX_EXPERIENCE}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  maxLength={MAX_CHARS_BIO}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  className={`${clayInputClass} resize-none`}
                  style={clayInputStyle}
                  placeholder="Enter a brief bio..."
                />
                {renderCharCounter(formData.bio || "", MAX_CHARS_BIO)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                  className={clayInputClass}
                  style={clayInputStyle}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="clay-btn disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ padding: "8px 20px", fontSize: "13px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (mode === "select-doctor" && !selectedDoctor && !member)
              }
              className="px-5 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                background: "#1f2937",
                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{member ? "Updating..." : "Adding..."}</span>
                </>
              ) : (
                <span>{member ? "Update Member" : "Add Member"}</span>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
