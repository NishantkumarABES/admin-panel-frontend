import { Mail, Phone, Briefcase, FileText, Building2, MapPin, Star, IndianRupee, Clock, Award, User } from "lucide-react";
import type { DoctorUser } from "../doctor.types";
import Modal from "../../../components/common/Modal";
import StatusBadge from "../../../components/common/StatusBadge";
import maleDoctorPlaceholder from "../../../assets/placeholders/male_doctor.jpg";
import femaleDoctorPlaceholder from "../../../assets/placeholders/female_doctor.jpg";


interface DoctorDetailsModalProps {
  doctor: DoctorUser | null;
  isOpen: boolean;
  onClose: () => void;
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

export default function DoctorDetailsModal({
  doctor,
  isOpen,
  onClose,
}: DoctorDetailsModalProps) {
  if (!doctor) return null;

  const profile = doctor.doctor_profile;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Doctor Details" size="md">
      {/* Header */}
      <div className="flex items-center justify-between pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-3">

          <img
            src={
              doctor.doctor_profile?.profile_photo
                ? doctor.doctor_profile.profile_photo
                : doctor.gender === "male"
                  ? maleDoctorPlaceholder
                  : femaleDoctorPlaceholder
            }
            alt={doctor.full_name}
            className="w-10 h-10 rounded-lg object-cover"
          />

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {doctor.full_name}
            </h3>
            <p className="text-sm text-gray-600">
              {profile?.specialization || "—"}
              {profile?.credentials && ` • ${profile.credentials}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {profile?.average_rating !== undefined && profile.average_rating > 0 && (
            <div className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{profile.average_rating.toFixed(1)}</span>
            </div>
          )}
          <StatusBadge status={doctor.state} size="sm" />
        </div>
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
        <InfoItem icon={Mail} label="Email" value={doctor.email} />
        <InfoItem
          icon={Phone}
          label="Phone"
          value={doctor.phone ? `${doctor.country_code} ${doctor.phone}` : null}
        />
        <InfoItem icon={User} label="Gender" value={doctor.gender ? doctor.gender.charAt(0).toUpperCase() + doctor.gender.slice(1) : null} />

        {/* Professional */}
        <InfoItem icon={FileText} label="License" value={profile?.license_number} />
        <InfoItem icon={Award} label="Medical Council" value={profile?.medical_council} />
        <InfoItem
          icon={Briefcase}
          label="Experience"
          value={
            profile?.years_of_experience
              ? `${profile.years_of_experience} years`
              : null
          }
        />
        <InfoItem
          icon={Clock}
          label="Consultation Duration"
          value={
            profile?.consultation_duration_minutes
              ? `${profile.consultation_duration_minutes} min`
              : null
          }
        />

        {/* Fees */}
        <InfoItem
          icon={IndianRupee}
          label="Consultation Fee"
          value={profile?.consultation_fee ? `₹${profile.consultation_fee}` : null}
        />
        <InfoItem
          icon={IndianRupee}
          label="Premium Online Fee"
          value={profile?.premium_online_fee ? `₹${profile.premium_online_fee}` : null}
        />

        {/* Clinic */}
        <InfoItem icon={Building2} label="Clinic" value={profile?.clinic_name} />
        <InfoItem icon={MapPin} label="Address" value={profile?.clinic_address} />
      </div>

      {/* Bio */}
      {profile?.bio && (
        <div className="pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="text-xs text-gray-500 mb-1">Bio</div>
          <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Timestamps */}



      <div className="flex items-center justify-between pt-4 mt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>

        {/* Left side timestamps */}
        <div className="text-xs text-gray-500 space-x-4">
          <span>Created: {new Date(doctor.created_at).toLocaleDateString()}</span>
          <span>Updated: {new Date(doctor.updated_at).toLocaleDateString()}</span>
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
