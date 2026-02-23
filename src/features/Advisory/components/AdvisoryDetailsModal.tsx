import { Mail, Phone, Briefcase, Calendar, User } from "lucide-react";
import type { AdvisoryMember } from "../advisory.types";
import Modal from "../../../components/common/Modal";
import StatusBadge from "../../../components/common/StatusBadge";

interface AdvisoryDetailsModalProps {
  member: AdvisoryMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdvisoryDetailsModal({
  member,
  isOpen,
  onClose,
}: AdvisoryDetailsModalProps) {
  if (!member) return null;

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
      <div
        className="flex items-start gap-3 py-2.5 px-3 rounded-xl transition-colors"
        style={{
          background: "rgba(0,0,0,0.015)",
          boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.04), inset -1px -1px 3px rgba(255, 255, 255, 0.5)",
        }}
      >
        <div
          className="clay-circle shrink-0"
          style={{
            width: "28px",
            height: "28px",
            background: "rgba(107, 150, 255, 0.06)",
          }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: "#6b96ff" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-0.5">{label}</div>
          <div className="text-sm text-gray-900 font-medium">{value}</div>
        </div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatGender = (gender: string | undefined) => {
    if (!gender) return undefined;
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Advisory Member Details" size="lg">
      <div className="space-y-4">
        {/* Header with Profile */}
        <div
          className="flex items-start gap-4 p-4 rounded-2xl"
          style={{
            background: "#f8f9fb",
            boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.05), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
          }}
        >
          {member.image ? (
            <img
              src={member.image}
              alt={member.full_name}
              className="w-16 h-16 rounded-xl object-cover"
              style={{
                boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.08), -3px -3px 6px rgba(255, 255, 255, 0.7)",
              }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(107, 150, 255, 0.08)",
                boxShadow: "3px 3px 6px rgba(0, 0, 0, 0.08), -3px -3px 6px rgba(255, 255, 255, 0.7)",
              }}
            >
              <span className="text-xl font-bold" style={{ color: "#6b96ff" }}>
                {member.full_name.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {member.full_name}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {member.specialization}
                </p>
              </div>
              <StatusBadge status={member.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {member.bio && (
          <div className="pt-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Bio</h4>
            <p
              className="text-sm text-gray-700 leading-relaxed p-3 rounded-xl"
              style={{
                background: "#f8f9fb",
                boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.04), inset -1px -1px 3px rgba(255, 255, 255, 0.5)",
              }}
            >
              {member.bio}
            </p>
          </div>
        )}

        {/* Personal & Professional Information */}
        <div className="pt-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Information
          </h4>
          <div className="space-y-2">
            <InfoRow icon={User} label="Gender" value={formatGender(member.gender)} />
            <InfoRow
              icon={Calendar}
              label="Date of Birth"
              value={member.date_of_birth ? formatDate(member.date_of_birth) : undefined}
            />
            <InfoRow
              icon={Briefcase}
              label="Years of Experience"
              value={`${member.years_of_experience} years`}
            />
            <InfoRow icon={Mail} label="Email" value={member.email} />
            <InfoRow icon={Phone} label="Phone" value={member.phone} />
          </div>
        </div>

        {/* Timeline Information */}
        <div className="pt-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Timeline</h4>
          <div className="space-y-2">
            <InfoRow
              icon={Calendar}
              label="Added to Advisory Panel"
              value={formatDate(member.created_at)}
            />
            <InfoRow
              icon={Calendar}
              label="Last Updated"
              value={formatDate(member.updated_at)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <button
          onClick={onClose}
          className="clay-btn"
          style={{ padding: "8px 20px", fontSize: "13px" }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
