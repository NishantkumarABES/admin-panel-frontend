import {
  Mail, Phone, User, Calendar, Droplets, MapPin, FileText, Pill, AlertTriangle, Activity, Scissors, Users, UserCheck, Heart, Shield, Hash, ClipboardList, CheckCircle2, XCircle,
} from "lucide-react";
import { useState } from "react";
import type { PatientUser } from "../patient.types";
import { calculateAge } from "../../../utils/calculateAge";
import Modal from "../../../components/common/Modal";
import StatusBadge from "../../../components/common/StatusBadge";
import malePatientPlaceholder from "../../../assets/placeholders/male_patient.jpg";
import femalePatientPlaceholder from "../../../assets/placeholders/female_patient.jpg";

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientUser | null;
}

type TabKey = "overview" | "medical" | "emergency" | "insurance";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "medical", label: "Medical" },
  { key: "emergency", label: "Emergency" },
  { key: "insurance", label: "Insurance" },
];

// Compact info item for grid layout
const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
}) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mt-0.5"
        style={{
          background: "rgba(99, 102, 241, 0.08)",
        }}
      >
        <Icon className="w-3.5 h-3.5 text-indigo-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm text-gray-800 font-medium mt-0.5 break-words">
          {value}
        </div>
      </div>
    </div>
  );
};

// Verification badge
const VerificationBadge = ({
  verified,
  label,
}: {
  verified: boolean;
  label: string;
}) => (
  <div
    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
    style={{
      background: verified ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
      color: verified ? "#059669" : "#dc2626",
    }}
  >
    {verified ? (
      <CheckCircle2 className="w-3 h-3" />
    ) : (
      <XCircle className="w-3 h-3" />
    )}
    {label}
  </div>
);

// Section wrapper for tab content
const Section = ({
  title,
  children,
  emptyMessage,
  isEmpty,
}: {
  title: string;
  children?: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}) => (
  <div>
    <h4
      className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
      style={{ letterSpacing: "0.08em" }}
    >
      {title}
    </h4>
    {isEmpty ? (
      <p className="text-sm text-gray-400 italic">{emptyMessage || "No data available"}</p>
    ) : (
      children
    )}
  </div>
);

export default function PatientDetailsModal({
  isOpen,
  onClose,
  patient,
}: PatientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  if (!patient) return null;

  const profile = patient.patient_profile;
  const profilePhoto = profile?.profile_photo;
  const avatarSrc = profilePhoto
    ? profilePhoto
    : patient.patient_profile?.profile_photo
      ? patient.patient_profile?.profile_photo
      : patient.gender === "male"
        ? malePatientPlaceholder
        : femalePatientPlaceholder;

  // Check if medical tab has any data
  const hasMedicalData = profile && (
    profile.blood_group ||
    profile.medical_history ||
    profile.current_medications ||
    profile.allergies ||
    profile.chronic_conditions ||
    profile.previous_surgeries ||
    profile.family_medical_history
  );

  // Check if emergency tab has any data
  const hasEmergencyData = profile && (
    profile.emergency_contact_name ||
    profile.emergency_contact_phone ||
    profile.emergency_contact_relationship
  );

  // Check if insurance tab has any data
  const hasInsuranceData = profile && (
    profile.insurance_provider ||
    profile.insurance_policy_number ||
    profile.insurance_coverage_details
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Details" size="md" contentClassName="flex flex-col overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto -mr-6 pr-6">
        {/* Header Card */}
        <div
          className="flex items-center gap-4 p-4 rounded-2xl mb-4"
          style={{
            background: "linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)",
            boxShadow:
              "inset 2px 2px 5px rgba(0, 0, 0, 0.03), inset -2px -2px 5px rgba(255, 255, 255, 0.7)",
          }}
        >
          <img
            src={avatarSrc}
            alt={patient.full_name}
            className="w-16 h-16 rounded-2xl object-cover"
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-gray-900">
                {patient.full_name}
              </h3>
              <StatusBadge status={patient.state} size="sm" />
            </div>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              ID: {patient.id}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <VerificationBadge
                verified={patient.is_email_verified}
                label="Email"
              />
              <VerificationBadge
                verified={patient.is_phone_verified}
                label="Phone"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-4"
          style={{
            background: "#f1f3f5",
            boxShadow:
              "inset 1px 1px 3px rgba(0,0,0,0.06), inset -1px -1px 3px rgba(255,255,255,0.5)",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-200"
              style={{
                background: activeTab === tab.key ? "#fff" : "transparent",
                color: activeTab === tab.key ? "#4f46e5" : "#6b7280",
                boxShadow:
                  activeTab === tab.key
                    ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)"
                    : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          className="rounded-2xl p-4 min-h-[200px]"
          style={{
            background: "#f8f9fb",
            boxShadow:
              "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
          }}
        >
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              <Section title="Contact Information">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={Mail} label="Email" value={patient.email} />
                  <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={
                      patient.phone
                        ? `${patient.country_code} ${patient.phone}`
                        : null
                    }
                  />
                </div>
              </Section>

              <Section title="Personal Details">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={User}
                    label="Gender"
                    value={
                      patient.gender
                        ? patient.gender.charAt(0).toUpperCase() +
                        patient.gender.slice(1)
                        : null
                    }
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Date of Birth"
                    value={(() => {
                      if (!patient.date_of_birth) return null;
                      const formatted = new Date(
                        patient.date_of_birth
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                      const age = calculateAge(patient.date_of_birth);
                      return age !== null ? `${formatted} (${age} yrs)` : formatted;
                    })()}
                  />
                  <InfoItem
                    icon={Droplets}
                    label="Blood Group"
                    value={profile?.blood_group}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Address"
                    value={profile?.address}
                  />
                </div>
              </Section>
            </div>
          )}

          {/* Medical Tab */}
          {activeTab === "medical" && (
            <div className="space-y-5">
              {!hasMedicalData ? (
                <Section title="Medical Information" isEmpty emptyMessage="No medical information recorded for this patient." />
              ) : (
                <>
                  <Section title="Health Overview">
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem
                        icon={Droplets}
                        label="Blood Group"
                        value={profile?.blood_group}
                      />
                      <InfoItem
                        icon={AlertTriangle}
                        label="Allergies"
                        value={profile?.allergies}
                      />
                      <InfoItem
                        icon={Activity}
                        label="Chronic Conditions"
                        value={profile?.chronic_conditions}
                      />
                      <InfoItem
                        icon={Pill}
                        label="Current Medications"
                        value={profile?.current_medications}
                      />
                    </div>
                  </Section>

                  <Section title="Medical History">
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem
                        icon={FileText}
                        label="Medical History"
                        value={profile?.medical_history}
                      />
                      <InfoItem
                        icon={Scissors}
                        label="Previous Surgeries"
                        value={profile?.previous_surgeries}
                      />
                      <InfoItem
                        icon={Users}
                        label="Family Medical History"
                        value={profile?.family_medical_history}
                      />
                    </div>
                  </Section>
                </>
              )}
            </div>
          )}

          {/* Emergency Tab */}
          {activeTab === "emergency" && (
            <div className="space-y-5">
              {!hasEmergencyData ? (
                <Section title="Emergency Contact" isEmpty emptyMessage="No emergency contact information recorded." />
              ) : (
                <Section title="Emergency Contact">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem
                      icon={UserCheck}
                      label="Contact Name"
                      value={profile?.emergency_contact_name}
                    />
                    <InfoItem
                      icon={Heart}
                      label="Relationship"
                      value={profile?.emergency_contact_relationship}
                    />
                    <InfoItem
                      icon={Phone}
                      label="Phone"
                      value={
                        profile?.emergency_contact_phone
                          ? `${profile.emergency_contant_country_code} ${profile.emergency_contact_phone}`
                          : null
                      }
                    />
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* Insurance Tab */}
          {activeTab === "insurance" && (
            <div className="space-y-5">
              {!hasInsuranceData ? (
                <Section title="Insurance Details" isEmpty emptyMessage="No insurance information recorded." />
              ) : (
                <Section title="Insurance Details">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem
                      icon={Shield}
                      label="Insurance Provider"
                      value={profile?.insurance_provider}
                    />
                    <InfoItem
                      icon={Hash}
                      label="Policy Number"
                      value={profile?.insurance_policy_number}
                    />
                    <InfoItem
                      icon={ClipboardList}
                      label="Coverage Details"
                      value={profile?.insurance_coverage_details}
                    />
                  </div>
                </Section>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timestamps & Close — pinned at bottom */}
      <div
        className="flex items-center justify-between pt-4 mt-4 shrink-0"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        {/* Left side timestamps */}
        <div className="text-xs text-gray-400 space-x-4">
          {patient.created_at && (
            <span>
              Created:{" "}
              {new Date(patient.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          {patient.updated_at && (
            <span>
              Updated:{" "}
              {new Date(patient.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Right side button */}
        <button
          onClick={onClose}
          className="clay-btn"
          style={{ fontSize: "13px", padding: "6px 16px" }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
