import React from "react";
import { Calendar, Clock, MapPin, Video, DollarSign, FileText, User, CheckCircle, XCircle } from "lucide-react";
import type { Event } from "../event.types";

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusBadge = (status: string) => {
  const statusColors: Record<string, { bg: string; color: string }> = {
    upcoming: { bg: "rgba(107, 150, 255, 0.1)", color: "#4b6fd4" },
    ongoing: { bg: "rgba(79, 207, 165, 0.1)", color: "#2ea87e" },
    completed: { bg: "rgba(107, 114, 128, 0.1)", color: "#4b5563" },
    cancelled: { bg: "rgba(255, 112, 112, 0.1)", color: "#d94f4f" },
  };
  const s = statusColors[status] || statusColors.completed;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const getTypeBadge = (type: string) => {
  const typeColors: Record<string, { bg: string; color: string }> = {
    webinar: { bg: "rgba(162, 133, 255, 0.1)", color: "#7c56db" },
    conference: { bg: "rgba(99, 102, 241, 0.1)", color: "#4f46e5" },
    cme: { bg: "rgba(245, 158, 11, 0.1)", color: "#b45309" },
    patient_education: { bg: "rgba(236, 72, 153, 0.1)", color: "#be185d" },
    workshop: { bg: "rgba(6, 182, 212, 0.1)", color: "#0e7490" },
  };
  const t = typeColors[type] || { bg: "rgba(107, 114, 128, 0.1)", color: "#4b5563" };
  const displayName = type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: t.bg, color: t.color }}>
      {displayName}
    </span>
  );
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};

const formatTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const insetSectionStyle = {
  background: "#f8f9fb",
  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
  borderRadius: "12px",
  padding: "12px 14px",
};

export default function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  if (!isOpen || !event) return null;

  const BackendBaseURL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8000';

  const InfoRow = ({
    icon: Icon, label, value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number | undefined | React.ReactNode;
  }) => {
    if (!value && value !== 0) return null;
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
            <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1 px-6 py-4">
            <div className="space-y-4">
              {/* Header with Event Info */}
              <div className="pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(event.status)}
                  {getTypeBadge(event.event_type)}
                  {event.is_featured && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#b45309" }}>
                      Featured Event
                    </span>
                  )}
                  {event.is_free && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(79, 207, 165, 0.1)", color: "#2ea87e" }}>
                      Free
                    </span>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div style={insetSectionStyle}>
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Date & Time</div>
                <InfoRow icon={Calendar} label="Date" value={`${formatDate(event.start_date)}${event.start_date !== event.end_date ? ` to ${formatDate(event.end_date)}` : ''}`} />
                <InfoRow icon={Clock} label="Time" value={`${formatTime(event.start_time)} - ${formatTime(event.end_time)} (${event.duration_minutes} minutes)`} />
              </div>

              {/* Event Info */}
              <div style={insetSectionStyle}>
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Event Information</div>
                <InfoRow icon={FileText} label="Specialization" value={event.specialization} />
                <InfoRow icon={Video} label="Format" value={event.format.charAt(0).toUpperCase() + event.format.slice(1)} />
                {event.venue && <InfoRow icon={MapPin} label="Venue" value={event.venue} />}
                {event.event_link && (
                  <InfoRow
                    icon={Video}
                    label="Event Link"
                    value={
                      <a href={event.event_link} target="_blank" rel="noopener noreferrer" style={{ color: "#6b96ff" }} className="hover:underline break-all">
                        {event.event_link}
                      </a>
                    }
                  />
                )}
              </div>

              {/* Registration */}
              <div style={insetSectionStyle}>
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Registration</div>
                <InfoRow icon={DollarSign} label="Registration Fee" value={event.is_free ? "Free" : `₹${parseFloat(event.registration_fee).toFixed(2)}`} />
                <InfoRow
                  icon={event.is_certificate_available ? CheckCircle : XCircle}
                  label="Certificate"
                  value={event.is_certificate_available ? "Available" : "Not Available"}
                />
              </div>

              {/* Speakers */}
              {event.speakers && event.speakers.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Speakers</div>
                  <div className="space-y-2">
                    {event.speakers.map((speaker) => (
                      <div key={speaker.id} className="flex items-start gap-3 p-3 rounded-xl" style={insetSectionStyle}>
                        <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{speaker.name}</div>
                          <div className="text-xs text-gray-600">{speaker.title}</div>
                          {speaker.bio && <div className="text-xs text-gray-500 mt-1">{speaker.bio}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agenda */}
              {event.agenda && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Agenda</div>
                  <div className="rounded-xl p-4" style={insetSectionStyle}>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{event.agenda}</pre>
                  </div>
                </div>
              )}

              {/* Event Images */}
              {event.images && event.images.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Event Images</div>
                  <div className="grid grid-cols-3 gap-3">
                    {event.images.map((image) => (
                      <div key={image.id} className="aspect-square rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                        <img src={BackendBaseURL + image.image} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
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