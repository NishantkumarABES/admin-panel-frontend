import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { DoctorUser } from "../doctor.types";
import Modal from "../../../components/common/Modal";

interface VerifyDoctorModalProps {
  doctor: DoctorUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (doctorId: string, action: "verified" | "rejected", notes?: string, rejectionReason?: string) => void;
}

export default function VerifyDoctorModal({
  doctor,
  isOpen,
  onClose,
  onSubmit,
}: VerifyDoctorModalProps) {
  const [action, setAction] = useState<"verified" | "rejected" | null>(null);
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const handleClose = () => {
    setAction(null);
    setNotes("");
    setRejectionReason("");
    onClose();
  };

  const handleSubmit = () => {
    if (!doctor || !action) return;

    onSubmit(
      doctor.id,
      action,
      notes || undefined,
      action === "rejected" ? rejectionReason : undefined
    );
    handleClose();
  };

  if (!doctor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Doctor Verification"
      size="md"
    >
      <div className="space-y-6">
        {/* Doctor Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-1">
            Dr. {doctor.full_name}
          </h3>
          <p className="text-sm text-gray-600">{doctor.specializations[0]}</p>
          <p className="text-sm text-gray-600">
            License: {doctor.license_number}
          </p>
        </div>

        {/* Warning Notice */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900 mb-1">
              Verification Action
            </p>
            <p className="text-sm text-amber-700">
              Please review all doctor documents and credentials before making
              a verification decision. This action will be logged in the audit
              trail.
            </p>
          </div>
        </div>

        {/* Action Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Verification Decision *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAction("verified")}
              className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                action === "verified"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              <CheckCircle
                className={`w-5 h-5 ${
                  action === "verified" ? "text-emerald-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  action === "verified" ? "text-emerald-700" : "text-gray-600"
                }`}
              >
                Approve
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAction("rejected")}
              className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                action === "rejected"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-red-300"
              }`}
            >
              <XCircle
                className={`w-5 h-5 ${
                  action === "rejected" ? "text-red-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  action === "rejected" ? "text-red-700" : "text-gray-600"
                }`}
              >
                Reject
              </span>
            </button>
          </div>
        </div>

        {/* Rejection Reason (only shown if rejecting) */}
        {action === "rejected" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              placeholder="Provide a clear reason for rejection..."
              required
            />
          </div>
        )}

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            placeholder="Add any additional notes or observations..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!action || (action === "rejected" && !rejectionReason)}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
            !action || (action === "rejected" && !rejectionReason)
              ? "bg-gray-400 cursor-not-allowed"
              : action === "verified"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {action === "verified" ? "Approve Doctor" : "Reject Doctor"}
        </button>
      </div>
    </Modal>
  );
}
