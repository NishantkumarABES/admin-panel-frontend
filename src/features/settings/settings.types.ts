export type SettingType =
  | 'privacy_policy'
  | 'terms_and_conditions'
  | 'contact_us'
  | 'about_us'
  | 'cookie_policy';


export interface SettingItem {
  id: string;
  type: SettingType;
  title: string;
  content: string;
  updatedAt: string;
  updatedBy?: string;
  version?: number;
}


export interface Setting {
  detail: string;
  data: SettingItem[];
  success: boolean;
}

export interface UpdateSettingDTO {
  content: string;
  title?: string;
}

