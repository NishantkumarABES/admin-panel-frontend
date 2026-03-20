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
    const response = await settingsService.updateSetting(type, data);
    // Handle both response shapes: wrapped { data: SettingItem[] } or direct SettingItem
    let updatedItem: SettingItem | null = null;
    if (Array.isArray((response as any).data)) {
      updatedItem = (response as any).data.find((s: SettingItem) => s.type === type) || (response as any).data[0];
    } else if ((response as any).content !== undefined) {
      updatedItem = response as unknown as SettingItem;
    }
    // Fallback: preserve the content that was just saved
    if (!updatedItem) {
      updatedItem = { ...settings[type], content: data.content } as SettingItem;
    }
    setSettings((prev) => ({
      ...prev,
      [type]: updatedItem,
    }));
  };

  const currentSetting = settings[activeTab];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, minHeight: 0 }} className="min-w-0 max-w-full">

      {/* Error Message */}
      {error && (
        <div
          className="rounded-xl p-4"
          style={{
            background: "rgba(255, 112, 112, 0.06)",
            boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.04), inset -2px -2px 4px rgba(255, 255, 255, 0.5)",
          }}
        >
          <p className="text-sm" style={{ color: "#c53030" }}>{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="clay-card" style={{ padding: 0, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" as const, minHeight: 0 }}>
        <div
          style={{
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                style={activeTab === tab.id ? {
                  background: "rgba(0,0,0,0.015)",
                  boxShadow: "inset 0 -2px 0 #1f2937",
                } : {}}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6" style={{ flex: 1, display: "flex", flexDirection: "column" as const, minHeight: 0 }}>
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
