import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, AlertCircle, Pencil } from 'lucide-react';
import type { SettingItem, SettingType, UpdateSettingDTO } from '../settings.types';

interface Contact {
  name: string;
  phone: string;
  email: string;
  message: string;
}

interface ContactTableProps {
  type: SettingType;
  title: string;
  setting: SettingItem | null;
  loading: boolean;
  onSave: (type: SettingType, data: UpdateSettingDTO) => Promise<void>;
}

const clayInputClass = "w-full px-3 py-2 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:outline-none";
const clayInputStyle = {
  background: "#eff1f5",
  border: "none",
  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.08), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
};

export default function ContactTable({
  type,
  title,
  setting,
  loading,
  onSave,
}: ContactTableProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [originalContactsCount, setOriginalContactsCount] = useState(0);

  useEffect(() => {
    if (setting?.content) {
      try {
        const parsed = JSON.parse(setting.content);
        const contactsArray = Array.isArray(parsed) ? parsed : [];
        setContacts(contactsArray);
        setOriginalContactsCount(contactsArray.length);
      } catch (err) {
        setContacts([]);
        setOriginalContactsCount(0);
      }
    } else {
      setContacts([]);
      setOriginalContactsCount(0);
    }
  }, [setting]);

  const handleAddContact = () => {
    setContacts([...contacts, { name: '', phone: '', email: '', message: '' }]);
    setIsEditing(true);
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleEditContact = (index: number) => {
    console.log('Editing contact at index:', index);
    setIsEditing(true);
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  const handleSave = async () => {
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      if (!contact.name.trim()) {
        setError(`Contact ${i + 1}: Name is required`);
        return;
      }
      if (!contact.phone.trim()) {
        setError(`Contact ${i + 1}: Phone number is required`);
        return;
      }
      if (!contact.email.trim()) {
        setError(`Contact ${i + 1}: Email is required`);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact.email)) {
        setError(`Contact ${i + 1}: Invalid email format`);
        return;
      }
    }

    setSaving(true);
    setError('');
    try {
      await onSave(type, { content: JSON.stringify(contacts) });
      setOriginalContactsCount(contacts.length);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (setting?.content) {
      try {
        const parsed = JSON.parse(setting.content);
        setContacts(Array.isArray(parsed) ? parsed : []);
      } catch (err) {
        setContacts([]);
      }
    } else {
      setContacts([]);
    }
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="clay-skeleton" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="pb-4 mb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {setting?.updatedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(setting.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={handleAddContact}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                }}
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="clay-btn flex items-center gap-2 disabled:opacity-50"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                  style={{
                    background: "#1f2937",
                    boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="mb-4 p-4 rounded-xl flex items-start gap-3"
          style={{
            background: "rgba(255, 112, 112, 0.06)",
            boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.04), inset -2px -2px 4px rgba(255, 255, 255, 0.5)",
          }}
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#ff7070" }} />
          <p className="text-sm" style={{ color: "#c53030" }}>{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          className="min-w-full divide-y divide-gray-100 rounded-xl overflow-hidden"
          style={{
            background: "#f8f9fb",
            boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.03), inset -1px -1px 3px rgba(255, 255, 255, 0.4)",
          }}
        >
          <thead
            style={{
              background: "#f0f2f6",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                Sl No
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Message
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No contacts available. Click "Add Contact" to create one.
                </td>
              </tr>
            ) : (
              contacts.map((contact, index) => (
                <tr key={index} className="hover:bg-white/60 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                        className={clayInputClass}
                        style={clayInputStyle}
                        placeholder="Enter name"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{contact.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                        className={clayInputClass}
                        style={clayInputStyle}
                        placeholder="Enter phone"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{contact.phone}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                        className={clayInputClass}
                        style={clayInputStyle}
                        placeholder="Enter email"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{contact.email}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <textarea
                        value={contact.message}
                        onChange={(e) => handleContactChange(index, 'message', e.target.value)}
                        className={`${clayInputClass} resize-none`}
                        style={clayInputStyle}
                        placeholder="Enter message"
                        rows={2}
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{contact.message}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!isEditing && (
                        <button
                          onClick={() => handleEditContact(index)}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          title="Edit contact"
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
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {!isEditing && (
                        <button
                          onClick={() => handleRemoveContact(index)}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          title="Remove contact"
                          style={{ color: "#ff7070" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 112, 112, 0.08)";
                            e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {isEditing && index < originalContactsCount && (
                        <button
                          onClick={() => handleRemoveContact(index)}
                          className="p-1.5 rounded-lg transition-all duration-200"
                          title="Remove contact"
                          style={{ color: "#ff7070" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 112, 112, 0.08)";
                            e.currentTarget.style.boxShadow = "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
