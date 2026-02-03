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
  // const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
    // setEditingIndex(index);
    setIsEditing(true);
  };

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  const handleSave = async () => {
    // Validate contacts
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
      // Basic email validation
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
      // setEditingIndex(null);
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
    // setEditingIndex(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {setting?.updatedAt && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(setting.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={handleAddContact}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
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
        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Sl No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No contacts available. Click "Add Contact" to create one.
                  </td>
                </tr>
              ) : (
                contacts.map((contact, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
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
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit contact"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {!isEditing && (
                          <button
                            onClick={() => handleRemoveContact(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove contact"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {isEditing && index < originalContactsCount && (
                          <button
                            onClick={() => handleRemoveContact(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove contact"
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
    </div>
  );
}
