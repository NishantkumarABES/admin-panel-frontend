import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { DoctorUser, CreateDoctorDTO } from "../doctor.types";
import Modal from "../../../components/common/Modal";
import { SPECIALTIES } from "../doctor.types";
import { ChevronDown, Search, Copy, Check, Eye, EyeOff, AlertCircle, X } from "lucide-react";
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';


interface AddEditDoctorModalProps {
  doctor: DoctorUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDoctorDTO) => Promise<{ password?: string; error?: string }>;
}

const initialFormData: CreateDoctorDTO = {
  fullName: "",
  email: "",
  phone: "",
  countryCode: "+91",
  specialty: "",
  licenseNumber: "",
  yearsOfExperience: 0,
  gender: "male",
};

export default function AddEditDoctorModal({
  doctor,
  isOpen,
  onClose,
  onSubmit,
}: AddEditDoctorModalProps) {
  const [formData, setFormData] = useState<CreateDoctorDTO>(initialFormData);
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [isSpecialtyDropdownOpen, setIsSpecialtyDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const phoneContainerRef = useRef<HTMLDivElement>(null);
  // const [phoneDropdownStyle, setPhoneDropdownStyle] = useState<React.CSSProperties>({});

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [experienceError, setExperienceError] = useState<string | null>(null);

  // Password display states
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

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
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (doctor) {
      setFormData({
        fullName: doctor.full_name,
        email: doctor.email,
        phone: doctor.phone,
        countryCode: doctor.country_code,
        specialty: doctor.doctor_profile.specialization,
        licenseNumber: doctor.doctor_profile.license_number,
        yearsOfExperience: doctor.doctor_profile.years_of_experience,
        gender: doctor.gender || "male" as "male" | "female" | "other",
      });
    } else {
      setFormData(initialFormData);
    }
    // Reset submission states when modal opens/closes
    setSubmitSuccess(false);
    setSubmitError(null);
    setGeneratedPassword(null);
    setCopied(false);
    setShowPassword(true);
    setExperienceError(null);
  }, [doctor, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsideTrigger =
        containerRef.current && containerRef.current.contains(target);

      const clickedInsidePortal =
        portalRef.current && portalRef.current.contains(target);

      // Also ignore clicks on the trigger button itself — let its onClick handle toggling
      const clickedOnTrigger =
        triggerRef.current && triggerRef.current.contains(target);

      if (!clickedInsideTrigger && !clickedInsidePortal && !clickedOnTrigger) {
        setIsSpecialtyDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter specialties based on search
  const filteredSpecialties = SPECIALTIES.filter((specialty) =>
    specialty.toLowerCase().includes(specialtySearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExperienceError(null);

    // Validate years of experience
    if (formData.yearsOfExperience < 1) {
      setExperienceError("Years of experience must be at least 1");
      return;
    }

    // Validate email length
    if (formData.email.length > 254) {
      setSubmitError("Email cannot exceed 254 characters");
      return;
    }

    // Validate license number length
    if (formData.licenseNumber.length > 15) {
      setSubmitError("License Number cannot exceed 15 characters");
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
        if (result.password && !doctor) {
          // New doctor created with password
          setGeneratedPassword(result.password);
        } else if (doctor) {
          // Doctor updated - auto close after showing success
          setTimeout(() => { handleClose(); }, 1500);
        }
      }
    } catch (error: any) {
      setSubmitError(error?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitSuccess && !doctor) {
      // If we just created a doctor successfully, don't reset yet
      // Let the user see the password and manually close
      setFormData(initialFormData);
      setSpecialtySearch("");
      setIsSpecialtyDropdownOpen(false);
      setSubmitSuccess(false);
      setSubmitError(null);
      setGeneratedPassword(null);
      setCopied(false);
      setExperienceError(null);
      onClose();
    } else {
      setFormData(initialFormData);
      setSpecialtySearch("");
      setIsSpecialtyDropdownOpen(false);
      setSubmitSuccess(false);
      setSubmitError(null);
      setGeneratedPassword(null);
      setCopied(false);
      setExperienceError(null);
      onClose();
    }
  };

  const handleCopyPassword = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy password:", error);
    }
  };

  const handleSpecialtySelect = (specialty: string) => {
    setFormData({ ...formData, specialty });
    setSpecialtySearch("");
    setIsSpecialtyDropdownOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={doctor ? "Edit Doctor" : "Add Doctor"}
    >
      {submitSuccess ? (
        generatedPassword ? (
          <div className="space-y-4 max-h-[calc(80vh-140px)] overflow-y-auto pr-2 custom-scrollbar" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 transparent'
          }}>
            {/* Success Header */}
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow: "4px 4px 12px rgba(16, 185, 129, 0.2), -2px -2px 8px rgba(255, 255, 255, 0.1)"
            }}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">Doctor Added Successfully!</h3>
                <p className="text-white/90 text-xs mt-0.5">
                  A temporary password has been generated for this doctor
                </p>
              </div>
            </div>

            {/* Password Display */}
            <div className="rounded-xl p-4" style={{
              background: "#f8f9fb",
              boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
            }}>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-900">
                  Temporary Password
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 rounded-lg hover:bg-gray-200/50 transition-colors"
                    style={{
                      background: "#eff1f5",
                      boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.08), -2px -2px 4px rgba(255, 255, 255, 0.6)"
                    }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={handleCopyPassword}
                    className="p-1.5 rounded-lg hover:bg-gray-200/50 transition-colors"
                    style={{
                      background: "#eff1f5",
                      boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.08), -2px -2px 4px rgba(255, 255, 255, 0.6)"
                    }}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              <div className="px-4 py-3 rounded-lg font-mono text-sm" style={{
                background: "#ffffff",
                boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.8)"
              }}>
                {showPassword ? generatedPassword : "••••••••••••"}
              </div>
              <div className="mt-3 flex items-start gap-2 p-3 rounded-lg" style={{
                background: "#fef3c7",
                border: "1px solid #fbbf24"
              }}>
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Please save this password securely. The doctor will need to change it upon first login.
                </p>
              </div>
            </div>

            {/* Close Button - Fixed at Bottom */}
            <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
              borderTop: "1px solid rgba(0,0,0,0.06)",
              marginLeft: "-2px",
              marginRight: "-2px",
              paddingLeft: "2px",
              paddingRight: "2px"
            }}>
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
          </div>
        ) : (
          /* Update success message - matches advertisement pattern */
          <div className="space-y-4 max-h-[calc(80vh-140px)] overflow-y-auto pr-2 custom-scrollbar" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 transparent'
          }}>
            <div className="rounded-xl p-4" style={{ background: "rgba(79, 207, 165, 0.08)", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.5)" }}>
              <p className="text-sm text-emerald-800">
                Doctor <span className="font-semibold">{formData.fullName}</span> has been successfully updated.
              </p>
            </div>

            {/* Done Button */}
            <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
              borderTop: "1px solid rgba(0,0,0,0.06)",
              marginLeft: "-2px",
              marginRight: "-2px",
              paddingLeft: "2px",
              paddingRight: "2px"
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
        )
      ) : (
        <div className="flex flex-col h-full">
          {/* Close Button - Top Right with Click Animation */}
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

          {/* Scrollable Form Content */}
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar" style={{
              maxHeight: 'calc(80vh - 140px)',
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 transparent'
            }}>
              {/* Error Message */}
              {submitError && (
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{
                  background: "#fee",
                  border: "1px solid #fcc"
                }}>
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* Personal Information Section */}
              <div className="rounded-xl px-5 py-4" style={{
                background: "#f8f9fb",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
              }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  Personal Information
                </h3>

                {/* Full Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                    }}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                    }}
                    placeholder="doctor@example.com"
                    required
                    maxLength={254}
                  />
                </div>

                {/* Phone Number */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div ref={phoneContainerRef} className="phone-input-wrapper">
                    <PhoneInput
                      defaultCountry="in"
                      value={`${formData.countryCode}${formData.phone}`}
                      onChange={(phone, meta) => {
                        const countryCode = meta.country.dialCode;
                        const phoneNumber = phone.replace(`+${countryCode}`, '');
                        setFormData({
                          ...formData,
                          countryCode: `+${countryCode}`,
                          phone: phoneNumber,
                        });
                      }}
                      inputStyle={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '14px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.05)',
                      }}
                      countrySelectorStyleProps={{
                        buttonStyle: {
                          borderRadius: '12px 0 0 12px',
                          background: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRight: 'none',
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: option.value as "male" | "female" | "other" })}
                        className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${formData.gender === option.value
                          ? "text-white"
                          : "text-gray-700 hover:bg-gray-50"
                          }`}
                        style={
                          formData.gender === option.value
                            ? {
                              background: "#1f2937",
                              boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                            }
                            : {
                              background: "#ffffff",
                              border: "1px solid #e5e7eb",
                              boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.04)"
                            }
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Professional Details Section */}
              <div className="rounded-xl px-5 py-4" style={{
                background: "#f8f9fb",
                boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)"
              }}>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  Professional Details
                </h3>

                {/* Specialty Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialty *
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <div
                      ref={triggerRef}
                      className="w-full px-4 py-2.5 text-sm rounded-xl cursor-pointer transition-all focus:ring-2 focus:ring-gray-900"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      onClick={() => {
                        if (!isSpecialtyDropdownOpen && triggerRef.current) {
                          const rect = triggerRef.current.getBoundingClientRect();
                          setDropdownPosition({
                            top: rect.bottom + window.scrollY,
                            left: rect.left + window.scrollX,
                            width: rect.width,
                          });
                        }
                        setIsSpecialtyDropdownOpen(!isSpecialtyDropdownOpen);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={formData.specialty ? "text-gray-900" : "text-gray-400"}>
                          {formData.specialty || "Select specialty"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSpecialtyDropdownOpen ? "rotate-180" : ""}`} />
                      </div>
                    </div>

                    {isSpecialtyDropdownOpen && createPortal(
                      <div
                        ref={containerRef}
                        className="fixed bg-white rounded-xl overflow-hidden"
                        style={{
                          top: dropdownPosition.top + 4,
                          left: dropdownPosition.left,
                          width: dropdownPosition.width,
                          maxHeight: '240px',
                          zIndex: 9999,
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)",
                          border: "1px solid #e5e7eb"
                        }}
                      >
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              className="w-full pl-10 pr-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
                              style={{
                                background: "#f8f9fb",
                                border: "1px solid #e5e7eb"
                              }}
                              placeholder="Search specialties..."
                              value={specialtySearch}
                              onChange={(e) => setSpecialtySearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        {/* Specialty List */}
                        <div className="max-h-44 overflow-y-auto">
                          {filteredSpecialties.length > 0 ? (
                            filteredSpecialties.map((specialty) => (
                              <div
                                key={specialty}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${formData.specialty === specialty
                                  ? "bg-gray-900 text-white font-medium"
                                  : "hover:bg-gray-50 text-gray-700"
                                  }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSpecialtySelect(specialty);
                                }}
                              >
                                {specialty}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-sm text-gray-400 text-center">
                              No specialties found
                            </div>
                          )}
                        </div>
                      </div>,
                      document.body
                    )}
                  </div>
                </div>

                {/* License Number and Years of Experience - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  {/* License Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number *
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="e.g., MED123456"
                      required
                      maxLength={15}
                    />
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => {
                        setExperienceError(null);
                        setFormData({
                          ...formData,
                          yearsOfExperience: parseInt(e.target.value) || 0,
                        });
                      }}
                      className={`w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:outline-none transition-all ${experienceError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-900'
                        }`}
                      style={{
                        background: "#ffffff",
                        border: experienceError ? "1px solid #ef4444" : "1px solid #e5e7eb",
                        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      placeholder="e.g., 5"
                      min="1"
                      required
                    />
                    {experienceError && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {experienceError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button - Fixed Footer at Bottom */}
            <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
              borderTop: "1px solid rgba(0,0,0,0.06)",
              marginLeft: "-2px",
              marginRight: "-2px",
              paddingLeft: "2px",
              paddingRight: "2px"
            }}>
              <button
                type="submit"
                disabled={isSubmitting || doctor?.state === "deleted"}
                className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{doctor ? "Updating..." : "Adding..."}</span>
                  </>
                ) : (
                  <span>{doctor ? "Update Doctor" : "Add Doctor"}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}