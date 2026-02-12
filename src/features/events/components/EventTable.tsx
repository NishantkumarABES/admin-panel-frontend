import { Eye, Edit, Calendar, Clock, ExternalLink } from "lucide-react";
import type { Event } from "../event.types";

interface EventTableProps {
  events: Event[];
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
}

const getStatusBadge = (status: string) => {
  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    ongoing: "bg-emerald-100 text-emerald-800",
    completed: "bg-gray-100 text-gray-800",
    // cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}`}>
      {displayName}
    </span>
  );
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
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

export default function EventTable({
  events, onView, onEdit,
}: EventTableProps) {
  const BackendBaseURL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8000';

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No events found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-w-0">
      <div className="overflow-x-auto min-w-0">
        <table className="w-full table-auto divide-y divide-gray-200 min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap w-80">
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
          <tbody className="divide-y divide-gray-200">
            {events.map((event) => (
              <tr
                key={event.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    {event.images[0] && (
                      <img
                        src={BackendBaseURL + event.images[0].image}
                        alt={event.title}
                        className="w-12 h-12 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {event.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500 mb-1">
                          {event.specialization}
                        </div>
                        {event.is_featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
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
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <span className="truncate max-w-45">
                        {event.event_link}
                      </span>
                      <ExternalLink className="w-4 h-4" />
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
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(event)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      title="Edit Event"
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