import { Mail, Phone, Briefcase, Calendar, User } from "lucide-react";
import type { AdvisoryMember } from "../advisory.types";
import maleDoctorPlaceholder from "../../../assets/placeholders/male_doctor.jpg";
import femaleDoctorPlaceholder from "../../../assets/placeholders/female_doctor.jpg";

interface AdvisoryDetailsModalProps {
  member: AdvisoryMember | null;
  isOpen: boolean;
  onClose: () => void;
}

const insetSectionStyle = {
  background: "#f8f9fb",
  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
  borderRadius: "12px",
  padding: "12px 14px",
};

const getStatusBadge = (status: string) => {
  const statusColors: Record<string, { bg: string; color: string }> = {
    active: { bg: "rgba(79, 207, 165, 0.1)", color: "#2ea87e" },
    inactive: { bg: "rgba(107, 114, 128, 0.1)", color: "#4b5563" },
  };
  const s = statusColors[status] || statusColors.inactive;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function AdvisoryDetailsModal({
  member,
  isOpen,
  onClose,
}: AdvisoryDetailsModalProps) {
  if (!isOpen || !member) return null;

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
      <div className="flex items-start gap-3 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-0.5">{label}</div>
          <div className="text-sm text-gray-900">{value}</div>
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-[18px] w-full max-w-2xl max-h-[90vh] flex flex-col"
          style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Header */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-lg font-semibold text-gray-900">Advisory Member Details</h2>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1 px-6 py-4">
            <div className="space-y-4">
              {/* Header with Profile */}
              <div className="pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        member.image
                          ? member.image
                          : member.gender === "male"
                            ? maleDoctorPlaceholder
                            : femaleDoctorPlaceholder
                      }
                      alt={member.full_name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {member.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {member.specialization}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(member.status)}
                </div>
              </div>

              {/* Bio Section */}
              {member.bio && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Bio</div>
                  <div className="rounded-xl p-4" style={insetSectionStyle}>
                    <p className="text-sm text-gray-700 leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div style={insetSectionStyle}>
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Personal Information</div>
                <InfoRow icon={User} label="Gender" value={formatGender(member.gender)} />
                <InfoRow
                  icon={Calendar}
                  label="Date of Birth"
                  value={member.date_of_birth ? formatDate(member.date_of_birth) : undefined}
                />
              </div>

              {/* Professional Information */}
              <div style={insetSectionStyle}>
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Professional Information</div>
                <InfoRow
                  icon={Briefcase}
                  label="Years of Experience"
                  value={member.years_of_experience ? `${member.years_of_experience} years` : undefined}
                />
                <InfoRow icon={Mail} label="Email" value={member.email} />
                <InfoRow icon={Phone} label="Phone" value={member.phone} />
              </div>

              {/* Timeline Information */}
              <div style={insetSectionStyle}>
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Timeline</div>
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

          {/* Sticky Footer */}
          <div
            className="flex items-center justify-end px-6 py-4 shrink-0"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
          >
            <button
              onClick={onClose}
              className="clay-btn"
              style={{ fontSize: "13px", padding: "6px 16px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}