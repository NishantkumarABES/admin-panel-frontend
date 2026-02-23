import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

const toolbarBtnBase = "p-2 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed";

export default function RichTextEditor({
  content,
  onChange,
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const getActiveStyle = (isActive: boolean) => ({
    background: isActive ? "rgba(107, 150, 255, 0.1)" : "transparent",
    boxShadow: isActive
      ? "inset 2px 2px 4px rgba(0, 0, 0, 0.06), inset -2px -2px 4px rgba(255, 255, 255, 0.5)"
      : "none",
    color: isActive ? "#1f2937" : "#6b7280",
  });

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.06), inset -2px -2px 5px rgba(255, 255, 255, 0.5)",
        background: "#f8f9fb",
      }}
    >
      {editable && (
        <div
          className="p-2 flex flex-wrap gap-1"
          style={{
            background: "#f0f2f6",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={toolbarBtnBase}
            style={getActiveStyle(false)}
            title="Undo"
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                e.currentTarget.style.boxShadow = "inset 1px 1px 3px rgba(0, 0, 0, 0.05), inset -1px -1px 3px rgba(255, 255, 255, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={toolbarBtnBase}
            style={getActiveStyle(false)}
            title="Redo"
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                e.currentTarget.style.boxShadow = "inset 1px 1px 3px rgba(0, 0, 0, 0.05), inset -1px -1px 3px rgba(255, 255, 255, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="w-px mx-1" style={{ background: "rgba(0,0,0,0.08)" }} />

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={toolbarBtnBase}
            style={getActiveStyle(editor.isActive('heading', { level: 1 }))}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={toolbarBtnBase}
            style={getActiveStyle(editor.isActive('heading', { level: 2 }))}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={toolbarBtnBase}
            style={getActiveStyle(editor.isActive('heading', { level: 3 }))}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px mx-1" style={{ background: "rgba(0,0,0,0.08)" }} />

          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={toolbarBtnBase}
            style={getActiveStyle(editor.isActive('bold'))}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={toolbarBtnBase}
            style={getActiveStyle(editor.isActive('italic'))}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={toolbarBtnBase}
            style={getActiveStyle(editor.isActive('underline'))}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <div className="w-px mx-1" style={{ background: "rgba(0,0,0,0.08)" }} />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={toolbarBtnBase}
            style={getActiveStyle(editor.isActive('bulletList'))}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={toolbarBtnBase}
            style={getActiveStyle(editor.isActive('orderedList'))}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px mx-1" style={{ background: "rgba(0,0,0,0.08)" }} />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={toolbarBtnBase}
            style={getActiveStyle(editor.isActive({ textAlign: 'left' }))}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={toolbarBtnBase}
            style={getActiveStyle(editor.isActive({ textAlign: 'center' }))}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={toolbarBtnBase}
            style={getActiveStyle(editor.isActive({ textAlign: 'right' }))}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px mx-1" style={{ background: "rgba(0,0,0,0.08)" }} />

          {/* Links */}
          <button
            type="button"
            onClick={editor.isActive('link') ? removeLink : addLink}
            className={toolbarBtnBase}
            style={getActiveStyle(editor.isActive('link'))}
            title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        onClick={() => editor.commands.focus()}
        className={`prose prose-sm max-w-none p-4 min-h-[400px] cursor-text outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror:focus]:outline-none ${editable ? '' : ''}`}
        style={{
          background: editable ? "#ffffff" : "#f8f9fb",
        }}
      >
        <EditorContent
          editor={editor}
          className="focus:outline-none h-full outline-none"
        />
      </div>
    </div>
  );
}
