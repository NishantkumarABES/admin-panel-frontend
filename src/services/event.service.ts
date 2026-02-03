import { api } from "./api";
import type { 
    PaginatedResponse, CreateEventDTO, UpdateEventDTO, Event, EventAnalytics
} from "../features/events/event.types";

export interface EventFilters {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    event_type?: string;
    specialization?: string;
    date_from?: string;
    date_to?: string;
}

export const getEventsAnalytics = () =>
  api.get<EventAnalytics>("/analytics/admin/events/metrics/");

export const getEvents = async (filters: EventFilters = {}): Promise<{ data: PaginatedResponse<Event> }> => {
    const params = new URLSearchParams();

    if (filters.page) {
      params.append("page", filters.page.toString());
    }
    if (filters.page_size) {
        params.append("page_size", filters.page_size.toString());
    }
    if (filters.search) {
        params.append("search", filters.search);
    }
    if (filters.status) {
        params.append("status", filters.status);
    }
    if (filters.event_type) {
        params.append("event_type", filters.event_type);
    }
    if (filters.specialization) {
        params.append("specialization", filters.specialization);
    }
    if (filters.date_from) {
        params.append("date_from", filters.date_from);
    }
    if (filters.date_to) {
        params.append("date_to", filters.date_to);
    }

    const queryString = params.toString();
    const response = await api.get<PaginatedResponse<Event>>(
        `/events/${queryString ? `?${queryString}` : ""}`
    );

    return { data: response.data };
};

export const createEvent = async (eventData: CreateEventDTO): Promise<{ data: Event }> => {
    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
            value.forEach(file => formData.append("images", file));
        } else if (key === "speakers" && Array.isArray(value)) {
            formData.append("speakers", JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });
    const response = await api.post<Event>("/events/", formData);
    return { data: response.data };
};

export const updateEvent = async (eventData: UpdateEventDTO): Promise<{ data: Event }> => {
    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {

        if (key === "images" && Array.isArray(value)) {
            value.forEach(file => {
                if (file instanceof File) {
                    formData.append("images", file);
                }
            });
        } 
        
        else if (key === "speakers" && Array.isArray(value)) {
            formData.append("speakers", JSON.stringify(value));
        } 
        
        else if (value !== undefined && value !== null && key !== "id") {
            formData.append(key, String(value));
        }
    });

    const response = await api.patch<Event>(`/events/${eventData.id}/`, formData);
    return { data: response.data };
};


export const deleteEvent = async (eventId: string): Promise<void> => {
    await api.delete(`/events/${eventId}/`);
};