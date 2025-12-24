import {Mail, Phone, Briefcase, FileText} from "lucide-react";
import type { DoctorForm } from "../doctor.types";
import Modal from "../../../components/common/Modal";
import StatusBadge from "../../../components/common/StatusBadge";

interface DoctorDetailsModalProps {
  doctor: DoctorForm | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DoctorDetailsModal({
  doctor,
  isOpen,
  onClose,
}: DoctorDetailsModalProps) {
  if (!doctor) return null;

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number | undefined;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-0.5">{label}</div>
          <div className="text-sm text-gray-900">{value}</div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Doctor Details" size="lg">
      <div className="space-y-6">
        {/* Header with Profile */}
        <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Dr. {doctor.fullName}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{doctor.specialty}</p>
            <div className="flex items-center gap-2">
              <StatusBadge status={doctor.status} />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Contact Information
          </h4>
          <div className="space-y-2">
            <InfoRow icon={Mail} label="Email" value={doctor.email} />
            <InfoRow icon={Phone} label="Phone" value={doctor.phone} />
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Professional Information
          </h4>
          <div className="space-y-2">
            <InfoRow
              icon={FileText}
              label="License Number"
              value={doctor.licenseNumber}
            />
            <InfoRow
              icon={Briefcase}
              label="Years of Experience"
              value={`${doctor.yearsOfExperience} years`}
            />
          </div>
        </div>
      </div>
        

      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
