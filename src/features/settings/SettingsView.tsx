import { useState, useEffect } from 'react';
import { FileText, Shield, Mail, Info, Cookie } from 'lucide-react';
import SettingEditor from './components/SettingEditor';
import ContactTable from './components/ContactTable';
import { settingsService } from '../../services/settings.service';
import type { SettingType, UpdateSettingDTO, SettingItem } from './settings.types';

interface SettingTab {
  id: SettingType;
  label: string;
  icon: React.ReactNode;
}

const tabs: SettingTab[] = [
  {
    id: 'privacy_policy',
    label: 'Privacy Policy',
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: 'terms_and_conditions',
    label: 'Terms & Conditions',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: 'contact_us',
    label: 'Contact Us',
    icon: <Mail className="w-4 h-4" />,
  },
  {
    id: 'about_us',
    label: 'About Us',
    icon: <Info className="w-4 h-4" />,
  },
  {
    id: 'cookie_policy',
    label: 'Cookie Policy',
    icon: <Cookie className="w-4 h-4" />,
  },
];

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingType>('privacy_policy');
  const [settings, setSettings] = useState<Record<SettingType, SettingItem | null>>({
    privacy_policy: null,
    terms_and_conditions: null,
    contact_us: null,
    about_us: null,
    cookie_policy: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const allSettings = await settingsService.getAllSettings();
      const settingsMap: Record<SettingType, SettingItem | null> = {
        privacy_policy: null,
        terms_and_conditions: null,
        contact_us: null,
        about_us: null,
        cookie_policy: null,
      };

      allSettings.data.forEach((setting) => {
        settingsMap[setting.type] = setting;
      });

      setSettings(settingsMap);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type: SettingType, data: UpdateSettingDTO) => {
    const updatedSetting = await settingsService.updateSetting(type, data);
    setSettings((prev) => ({
      ...prev,
      [type]: updatedSetting,
    }));
  };

  const currentSetting = settings[activeTab];

  return (
    <div className="space-y-6">

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'contact_us' ? (
            <ContactTable
              type={activeTab}
              title={tabs.find((t) => t.id === activeTab)?.label || ''}
              setting={currentSetting}
              loading={loading}
              onSave={handleSave}
            />
          ) : (
            <SettingEditor
              type={activeTab}
              title={tabs.find((t) => t.id === activeTab)?.label || ''}
              setting={currentSetting}
              loading={loading}
              onSave={handleSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}
