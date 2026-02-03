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

  // Load doctors when switching to select-doctor mode
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={member ? "Edit Advisory Member" : "Add Advisory Member"}
      size="lg"
    >
      {submitSuccess ? (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-800">
              Advisory member has been successfully {member ? "updated" : "added"}.
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            </div>
          )}

          {!member && (
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === "manual"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Add Manually
              </button>
              <button
                type="button"
                onClick={() => setMode("select-doctor")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === "select-doctor"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
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
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Search by name, email, or specialization..."
                  />
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg max-h-77 overflow-y-auto">
                {loadingDoctors ? (
                  <div className="p-8 text-center text-gray-500">
                    Loading doctors...
                  </div>
                ) : filteredDoctors.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No doctors found
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        onClick={() => setSelectedDoctor(doctor)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedDoctor?.id === doctor.id
                          ? "bg-gray-100"
                          : ""
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
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
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
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              {/* Gender Field */}
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        years_of_experience: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter years"
                    min="1"
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
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  placeholder="Enter a brief bio..."
                />
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (mode === "select-doctor" && !selectedDoctor && !member)
              }
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
