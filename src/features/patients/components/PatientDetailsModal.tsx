import Modal from "../../../components/common/Modal";
import StatusBadge from "../../../components/common/StatusBadge";
import type { PatientUser } from "../patient.types";

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientUser;
}

export default function PatientDetailsModal({
  isOpen,
  onClose,
  patient,
}: PatientDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Profile" size="lg">
      <div className="space-y-6">
        {/* Header with Status */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {patient.full_name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Patient ID: {patient.id}</p>
          </div>
          <StatusBadge status={patient.is_active ? "active" : "inactive"} size="sm" />
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Email
              </label>
              <p className="text-sm text-gray-900 mt-1">{patient.email}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Phone
              </label>
              <p className="text-sm text-gray-900 mt-1">{patient.phone}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        {(patient.date_of_birth || patient.gender) && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patient.date_of_birth && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(patient.date_of_birth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              {patient.gender && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Gender
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{patient.gender}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Address */}
        {/* {patient.address && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Address
            </h4>
            <p className="text-sm text-gray-900">{patient.address}</p>
          </div>
        )} */}

        {/* Emergency Contact */}
        {/* {patient.emergencyContact && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Emergency Contact
            </h4>
            <p className="text-sm text-gray-900">{patient.emergencyContact}</p>
          </div>
        )} */}

        {/* Registration Date */}
        {patient.created_at && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Registration Date
            </h4>
            <p className="text-sm text-gray-900">
              {new Date(patient.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
