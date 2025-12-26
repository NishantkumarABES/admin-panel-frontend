import { api } from './api';
import type { Setting, SettingType, UpdateSettingDTO } from '../features/settings/settings.types';

export const settingsService = {
  // Get a specific setting by type
  getSetting: async (type: SettingType): Promise<Setting> => {
    const response = await api.get<Setting>(`/settings/${type}`);
    return response.data;
  },

  // Get all settings
  getAllSettings: async (): Promise<Setting[]> => {
    const response = await api.get<Setting[]>('/settings');
    return response.data;
  },

  // Update a setting
  updateSetting: async (type: SettingType, data: UpdateSettingDTO): Promise<Setting> => {
    const response = await api.put<Setting>(`/settings/${type}`, data);
    return response.data;
  },
};
