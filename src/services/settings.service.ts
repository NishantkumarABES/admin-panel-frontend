import { api } from './api';
import type { Setting, SettingType, UpdateSettingDTO } from '../features/settings/settings.types';

export interface SettingVersion {
  id: string;
  version: number;
  title: string;
  content: string;
  is_published: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

export interface ContactSubmission {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

export interface PaginatedContacts {
  detail: string;
  success: boolean;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: ContactSubmission[];
  };
}

export const settingsService = {
  // Get all settings
  getAllSettings: async (): Promise<Setting> => {
    const response = await api.get<Setting>('/cms/admin/settings/');
    return response.data;
  },

  // Get a specific setting by type
  getSetting: async (type: SettingType): Promise<Setting> => {
    const response = await api.get<Setting>(`/cms/admin/settings/${type}/`);
    return response.data;
  },

  // Update a setting (creates new version)
  updateSetting: async (type: SettingType, data: UpdateSettingDTO): Promise<Setting> => {
    const response = await api.put<Setting>(`/cms/admin/settings/${type}/`, data);
    return response.data;
  },

  // Get version history for a setting
  getVersionHistory: async (type: SettingType): Promise<SettingVersion[]> => {
    const response = await api.get<SettingVersion[]>(`/cms/admin/settings/${type}/versions/`);
    return response.data;
  },

  // Publish a specific version
  publishVersion: async (versionId: string): Promise<void> => {
    await api.post(`/cms/admin/versions/${versionId}/publish/`);
  },

  // Get contact submissions
  getContacts: async (params?: { search?: string; is_resolved?: boolean; page?: number }): Promise<PaginatedContacts> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.is_resolved !== undefined) searchParams.append('is_resolved', String(params.is_resolved));
    if (params?.page) searchParams.append('page', String(params.page));

    const queryString = searchParams.toString();
    const response = await api.get<PaginatedContacts>(`/cms/admin/contacts/${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Update contact submission (mark as resolved)
  updateContact: async (contactId: string, data: { is_resolved: boolean }): Promise<ContactSubmission> => {
    const response = await api.patch<{ success: boolean; data: ContactSubmission }>(`/cms/admin/contacts/${contactId}/`, data);
    return response.data.data;
  },
};
