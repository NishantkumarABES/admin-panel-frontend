import { Mail, Phone, User, Calendar } from "lucide-react";
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
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm text-gray-900 truncate">{value}</div>
      </div>
    </div>
  );
};

export default function PatientDetailsModal({
  isOpen,
  onClose,
  patient,
}: PatientDetailsModalProps) {
  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Details" size="md">
      {/* Header */}
      <div className="flex items-center justify-between pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-3">
          <img
            src={
              patient.image
                ? patient.image
                : patient.gender === "male"
                  ? malePatientPlaceholder
                  : femalePatientPlaceholder
            }
            alt={patient.full_name}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {patient.full_name}
            </h3>
            <p className="text-sm text-gray-600">
              Patient ID: {patient.id}
            </p>
          </div>
        </div>
        <StatusBadge status={patient.state} size="sm" />
      </div>

      {/* Content Grid */}
      <div
        className="grid grid-cols-2 gap-x-6 gap-y-3 py-4 px-3 rounded-xl my-3"
        style={{
          background: "#f8f9fb",
          boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
        }}
      >
        {/* Contact */}
        <InfoItem icon={Mail} label="Email" value={patient.email} />
        <InfoItem
          icon={Phone}
          label="Phone"
          value={patient.phone ? `${patient.country_code} ${patient.phone}` : null}
        />
        <InfoItem
          icon={User}
          label="Gender"
          value={patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : null}
        />
        <InfoItem
          icon={Calendar}
          label="Date of Birth"
          value={(() => {
            if (!patient.date_of_birth) return null;
            const formatted = new Date(patient.date_of_birth).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const age = calculateAge(patient.date_of_birth);
            return age !== null ? `${formatted} (${age} yrs)` : formatted;
          })()}
        />
      </div>

      {/* Timestamps & Close */}
      <div className="flex items-center justify-between pt-4 mt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        {/* Left side timestamps */}
        <div className="text-xs text-gray-500 space-x-4">
          {patient.created_at && (
            <span>Created: {new Date(patient.created_at).toLocaleDateString()}</span>
          )}
          {patient.updated_at && (
            <span>Updated: {new Date(patient.updated_at).toLocaleDateString()}</span>
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
