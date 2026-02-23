import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { DoctorUser, CreateDoctorDTO } from "../doctor.types";
import Modal from "../../../components/common/Modal";
import { SPECIALTIES } from "../doctor.types";
import { ChevronDown, Search, Copy, Check, Eye, EyeOff, AlertCircle } from "lucide-react";
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
  const [phoneDropdownStyle, setPhoneDropdownStyle] = useState<React.CSSProperties>({});

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [experienceError, setExperienceError] = useState<string | null>(null);

  // Password display states
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

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
      size="md"
    >
      {/* Success State - Show password for new doctors */}
      {submitSuccess && !doctor && generatedPassword ? (
        <div className="space-y-4">
          <div className="clay-inset" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
            <p className="text-sm text-emerald-800">
              Doctor account has been successfully created for <span className="font-semibold">{formData.fullName}</span>.
              The account is currently <span className="font-semibold">inactive</span> and will be activated when the doctor logs in for the first time.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                {formData.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temporary Password
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-900 flex items-center justify-between">
                  <span className="flex-1 break-all">
                    {showPassword ? generatedPassword : "••••••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                  title="Copy password"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="clay-inset" style={{ background: "rgba(255, 197, 84, 0.08)" }}>
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Important:</span> Please share these credentials securely with the doctor.
              An invitation email will be sent automatically. The doctor's account will become active upon first login.
              This password will not be shown again.
            </p>
          </div>

          <div className="flex justify-end pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
              style={{
                background: "#1f2937",
                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
              }}
            >
              Done
            </button>
          </div>
        </div>
      ) : submitSuccess && doctor ? (
        /* Success State - Doctor updated */
        <div className="space-y-4">
          <div className="clay-inset" style={{ background: "rgba(79, 207, 165, 0.08)" }}>
            <p className="text-sm text-emerald-800">
              Doctor <span className="font-semibold">{formData.fullName}</span> has been successfully updated.
            </p>
          </div>

          <div className="flex justify-end pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
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
        /* Form State */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {submitError && (
            <div className="clay-inset flex items-start gap-3" style={{ background: "rgba(255, 112, 112, 0.08)" }}>
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            </div>
          )}

          {/* Personal Details */}
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "#f8f9fb",
              boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
            }}
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              Personal Details
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex gap-3">
                <div className="flex-[2]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as "male" | "female" | "other" })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                {/* Wrapper onClick fires when the flag/country button is clicked, computing its fixed position before the library opens the dropdown */}
                <div
                  ref={phoneContainerRef}
                  onClick={() => {
                    const btn = phoneContainerRef.current?.querySelector(
                      ".react-international-phone-country-selector-button"
                    );
                    if (btn) {
                      const rect = btn.getBoundingClientRect();
                      setPhoneDropdownStyle({
                        position: "fixed",
                        top: rect.bottom + 4,
                        left: rect.left,
                        zIndex: 99999,
                        minWidth: 240,
                      });
                    }
                  }}
                >
                  <PhoneInput
                    defaultCountry="in"
                    value={formData.countryCode + formData.phone}
                    onChange={(_phone, phoneData) => {
                      const dialCode = phoneData.country?.dialCode
                        ? `+${phoneData.country.dialCode}`
                        : formData.countryCode;
                      const national = _phone.startsWith(dialCode)
                        ? _phone.slice(dialCode.length).trim()
                        : _phone;
                      setFormData({
                        ...formData,
                        countryCode: dialCode,
                        phone: national,
                      });
                    }}
                    inputProps={{
                      required: true,
                      placeholder: "Enter phone number",
                    }}
                    style={{ width: "100%" }}
                    countrySelectorStyleProps={{
                      dropdownStyleProps: {
                        style: phoneDropdownStyle,
                      },
                    }}
                  />
                </div>
              </div>
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
                  placeholder="Enter email address"
                  required
                  maxLength={254}
                />
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "#f8f9fb",
              boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
            }}
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              Professional Details
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialty *
                </label>
                <div className="relative" ref={dropdownRef}>
                  <div
                    ref={triggerRef}
                    className="w-full px-3 py-2 text-sm rounded-xl cursor-pointer"
                    style={{
                      background: "#eff1f5",
                      border: "none",
                      boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
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
                      <span className={formData.specialty ? "text-gray-900" : "text-gray-500"}>
                        {formData.specialty || "Select Specialty"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSpecialtyDropdownOpen ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {isSpecialtyDropdownOpen && createPortal(
                    <div
                      ref={containerRef}
                      className="fixed bg-white rounded-xl max-h-48 overflow-hidden"
                      style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                        zIndex: 9999,
                        boxShadow: "6px 6px 12px rgba(0, 0, 0, 0.08), -6px -6px 12px rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      <div className="p-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            style={{
                              background: "#eff1f5",
                              border: "none",
                              boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)",
                            }}
                            placeholder="Search specialties..."
                            value={specialtySearch}
                            onChange={(e) => setSpecialtySearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-36 overflow-y-auto">
                        {filteredSpecialties.length > 0 ? (
                          filteredSpecialties.map((specialty) => (
                            <div
                              key={specialty}
                              className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50 transition-colors ${formData.specialty === specialty ? "bg-gray-50 font-medium" : ""
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
                          <div className="px-3 py-1.5 text-xs text-gray-500 text-center">
                            No specialties found
                          </div>
                        )}
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${experienceError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter years"
                  min="1"
                  required
                />
                {experienceError && (
                  <p className="mt-1 text-xs text-red-600">{experienceError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number *
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter license number"
                  required
                  maxLength={15}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons — sticky footer */}
          <div
            className="flex justify-end gap-3 pt-4 mt-4 sticky bottom-0 bg-white pb-1 -mb-1"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
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
              disabled={isSubmitting || doctor?.state === "deleted"}
              className="px-4 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                background: "#1f2937",
                boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
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
      )}
    </Modal>
  );
}
