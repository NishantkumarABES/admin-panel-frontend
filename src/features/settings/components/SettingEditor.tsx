import { useState, useEffect } from 'react';
import { Save, Eye, Edit, AlertCircle } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import type { Setting, SettingType, UpdateSettingDTO } from '../settings.types';

interface SettingEditorProps {
  type: SettingType;
  title: string;
  setting: Setting | null;
  loading: boolean;
  onSave: (type: SettingType, data: UpdateSettingDTO) => Promise<void>;
}

export default function SettingEditor({
  type,
  title,
  setting,
  loading,
  onSave,
}: SettingEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (setting) {
      setContent(setting.content || '');
    }
  }, [setting]);

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave(type, { content });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(setting?.content || '');
    setIsEditing(false);
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
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
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
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Editor */}
      <div className="p-6">
        {isEditing ? (
          <RichTextEditor
            content={content}
            onChange={setContent}
            editable={true}
          />
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[400px]">
            {content ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div className="flex items-center justify-center h-[368px] text-gray-400">
                <div className="text-center">
                  <Eye className="w-12 h-12 mx-auto mb-2" />
                  <p>No content available. Click Edit to add content.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
