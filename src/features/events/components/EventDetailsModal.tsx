import { Calendar, Clock, MapPin, Video, Users, Award, DollarSign, FileText, User, CheckCircle, XCircle } from "lucide-react";
import type { Event } from "../event.types";

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusBadge = (status: string) => {
  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    ongoing: "bg-emerald-100 text-emerald-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const getTypeBadge = (type: string) => {
  const typeColors = {
    webinar: "bg-purple-100 text-purple-800",
    conference: "bg-indigo-100 text-indigo-800",
    cme: "bg-amber-100 text-amber-800",
    patient_education: "bg-pink-100 text-pink-800",
    workshop: "bg-cyan-100 text-cyan-800",
  };
  
  const displayName = type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}`}>
      {displayName}
    </span>
  );
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { 
    weekday: 'long',
    day: '2-digit',
    month: 'long', 
    year: 'numeric' 
  });
};

const formatTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default function EventDetailsModal({
  event, isOpen, onClose,
}: EventDetailsModalProps) {
  if (!event) return null;
  
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
      <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <Icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-0.5">{label}</div>
          <div className="text-sm text-gray-900">{value}</div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Event Details">
      <div className="space-y-6">
        {/* Header with Event Info */}
        <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{event.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(event.status)}
              {getTypeBadge(event.event_type)}
              {event.is_featured && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Featured Event
                </span>
              )}
              {event.is_free && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Free
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Date & Time Information */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Date & Time
          </h4>
          <div className="space-y-2">
            <InfoRow 
              icon={Calendar} 
              label="Date" 
              value={`${formatDate(event.start_date)}${event.start_date !== event.end_date ? ` to ${formatDate(event.end_date)}` : ''}`}
            />
            <InfoRow 
              icon={Clock} 
              label="Time" 
              value={`${formatTime(event.start_time)} - ${formatTime(event.end_time)} (${event.duration_minutes} minutes)`}
            />
          </div>
        </div>

        {/* Event Details */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Event Information
          </h4>
          <div className="space-y-2">
            <InfoRow 
              icon={FileText} 
              label="Specialization" 
              value={event.specialization}
            />
            <InfoRow 
              icon={Video} 
              label="Format" 
              value={event.format.charAt(0).toUpperCase() + event.format.slice(1)}
            />
            {event.venue && (
              <InfoRow 
                icon={MapPin} 
                label="Venue" 
                value={event.venue}
              />
            )}
            {event.meeting_link && (
              <InfoRow 
                icon={Video} 
                label="Meeting Link" 
                value={
                  <a 
                    href={event.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {event.meeting_link}
                  </a>
                }
              />
            )}
          </div>
        </div>

        {/* Registration & Capacity */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Registration & Capacity
          </h4>
          <div className="space-y-2">
            <InfoRow 
              icon={DollarSign} 
              label="Registration Fee" 
              value={event.is_free ? "Free" : `₹${parseFloat(event.registration_fee).toFixed(2)}`}
            />
            <InfoRow 
              icon={Users} 
              label="Attendees" 
              value={
                <div>
                  <div className="mb-2">{event.current_attendees} / {event.max_attendees} registered</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(event.current_attendees / event.max_attendees) * 100}%` }}
                    ></div>
                  </div>
                </div>
              }
            />
            {event.cme_credits > 0 && (
              <InfoRow 
                icon={Award} 
                label="CME Credits" 
                value={
                  <span className="font-semibold text-amber-600">
                    {event.cme_credits} Credits
                  </span>
                }
              />
            )}
            <InfoRow 
              icon={event.certificate_available ? CheckCircle : XCircle} 
              label="Certificate" 
              value={event.certificate_available ? "Available" : "Not Available"}
            />
          </div>
        </div>

        {/* Speakers */}
        {event.speakers && event.speakers.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Speakers
            </h4>
            <div className="space-y-3">
              {event.speakers.map((speaker) => (
                <div key={speaker.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{speaker.name}</div>
                    <div className="text-xs text-gray-600">{speaker.title}</div>
                    {speaker.bio && (
                      <div className="text-xs text-gray-500 mt-1">{speaker.bio}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agenda */}
        {event.agenda && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Agenda
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {event.agenda}
              </pre>
            </div>
          </div>
        )}

        {/* Event Images */}
        {event.images && event.images.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Event Images
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {event.images.map((image) => (
                <div key={image.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={BackendBaseURL + image.image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
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