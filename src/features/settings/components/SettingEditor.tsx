import { useState, useEffect } from 'react';
import { Save, Eye, Edit, AlertCircle } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import type { SettingItem, SettingType, UpdateSettingDTO } from '../settings.types';

interface SettingEditorProps {
  type: SettingType;
  title: string;
  setting: SettingItem | null;
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
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                }}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="clay-btn disabled:opacity-50"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
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
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#ff7070" }} />
          <p className="text-sm" style={{ color: "#c53030" }}>{error}</p>
        </div>
      )}

      {/* Editor */}
      <div>
        {isEditing ? (
          <RichTextEditor
            content={content}
            onChange={setContent}
            editable={true}
          />
        ) : (
          <div
            className="rounded-xl p-4 min-h-[400px]"
            style={{
              background: "#f8f9fb",
              boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)",
            }}
          >
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
