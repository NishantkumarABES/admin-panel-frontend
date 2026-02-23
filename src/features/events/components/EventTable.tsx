import { Eye, Edit, Calendar, Clock, ExternalLink } from "lucide-react";
import type { Event } from "../event.types";

interface EventTableProps {
  events: Event[];
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
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
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
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
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: t.bg, color: t.color }}
    >
      {displayName}
    </span>
  );
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default function EventTable({ events, onView, onEdit }: EventTableProps) {

  if (events.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500">No events found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden min-w-0">
      <div className="overflow-x-auto min-w-0">
        <table className="w-full table-auto divide-y divide-gray-100 min-w-max">
          <thead
            style={{
              background: "#f8f9fb",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-10">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Event Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Event Link
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((event, index) => (
              <tr key={event.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-4 py-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 mb-1 max-w-[300px] break-words">{event.title}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500">{event.specialization}</div>
                      {event.is_featured && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{ background: "rgba(245, 158, 11, 0.1)", color: "#b45309" }}
                        >
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-4 whitespace-nowrap">
                  {getTypeBadge(event.event_type)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-900">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(event.start_date)} - {formatDate(event.end_date)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {event.event_link ? (
                    <a
                      href={event.event_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1"
                      style={{ color: "#6b96ff" }}
                    >
                      <span className="truncate max-w-45 text-sm">{event.event_link}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getStatusBadge(event.status)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(event)}
                      className="p-1.5 rounded-lg transition-all duration-200"
                      title="View Details"
                      style={{ color: "#6b96ff" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(107, 150, 255, 0.08)";
                        e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(event)}
                      className="p-1.5 rounded-lg transition-all duration-200"
                      title="Edit Event"
                      style={{ color: "#6b7280" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(0, 0, 0, 0.04)";
                        e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}