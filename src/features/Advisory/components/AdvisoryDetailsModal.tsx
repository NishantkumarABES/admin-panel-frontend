import { Mail, Phone, Briefcase, FileText, Calendar, User } from "lucide-react";
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
      <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <Icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
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
    <Modal isOpen={isOpen} onClose={onClose} title="Advisory Member Details" size="lg">
      <div className="space-y-6">
        {/* Header with Profile */}
        <div className="flex items-start gap-4">
          {member.image && (
            <img
              src={member.image}
              alt={member.full_name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
          {!member.image && (
            <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-2xl font-medium">
                {member.full_name.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {member.full_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {member.specialization}
                </p>
              </div>
              <StatusBadge status={member.status} size="sm" />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Personal Information
          </h4>
          <div className="space-y-2">
            <InfoRow icon={User} label="Gender" value={formatGender(member.gender)} />
            <InfoRow
              icon={Calendar}
              label="Date of Birth"
              value={member.date_of_birth ? formatDate(member.date_of_birth) : undefined}
            />
          </div>
        </div>

        {/* Bio Section */}
        {member.bio && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Bio</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{member.bio}</p>
          </div>
        )}

        {/* Contact Information */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Contact Information
          </h4>
          <div className="space-y-2">
            <InfoRow icon={Mail} label="Email" value={member.email} />
            <InfoRow icon={Phone} label="Phone" value={member.phone} />
          </div>
        </div>

        {/* Professional Information */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Professional Information
          </h4>
          <div className="space-y-2">
            <InfoRow
              icon={FileText}
              label="Specialization"
              value={member.specialization}
            />
            <InfoRow
              icon={Briefcase}
              label="Years of Experience"
              value={`${member.years_of_experience} years`}
            />
          </div>
        </div>

        {/* Timeline Information */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h4>
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
