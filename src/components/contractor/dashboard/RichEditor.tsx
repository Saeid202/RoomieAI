import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import DOMPurify from 'dompurify';
import { useState, useRef } from 'react';
import { sanitizeHtml, ALLOWED_TAGS } from '@/utils/sanitizeHtml';
import { BubbleToolbar } from './BubbleToolbar';

const MAX_CHARS = 600;
const WARN_CHARS = 500;

export interface RichEditorProps {
  /** Initial HTML content (from description_html). Null renders empty doc. */
  initialContent: string | null;
  /** Called on every content change with the current sanitized HTML. */
  onChange: (html: string) => void;
  /** Called on every content change with the plain text extraction. */
  onPlainTextChange: (text: string) => void;
  /** Tailwind/CSS class forwarded to the outer wrapper div. */
  className?: string;
}

/**
 * Minimal Tiptap-based rich text editor for service descriptions.
 * Supports: Bold, Bullet List, Heading H3, Line Breaks.
 * Formatting toolbar appears as a floating bubble on text selection only.
 * Enforces a 600-character plain text limit.
 */
export function RichEditor({
  initialContent,
  onChange,
  onPlainTextChange,
  className,
}: RichEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        heading: { levels: [3] },
      }),
      CharacterCount.configure({ limit: MAX_CHARS }),
      Placeholder.configure({
        placeholder: 'Describe this service — what it includes, what makes it special…',
      }),
    ],
    content: initialContent ?? '',
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
      transformPastedHTML(html: string) {
        return DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [...ALLOWED_TAGS],
          ALLOWED_ATTR: [],
          KEEP_CONTENT: true,
        });
      },
    },
    onUpdate({ editor }) {
      const sanitized = sanitizeHtml(editor.getHTML()) ?? '';
      onChange(sanitized);
      onPlainTextChange(editor.getText());
    },
    onSelectionUpdate({ editor }) {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setShowToolbar(false);
        return;
      }
      // Position toolbar above the selection
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      try {
        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) return;
        const range = domSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        setToolbarPos({
          top: rect.top - wrapperRect.top - 48,
          left: Math.max(0, rect.left - wrapperRect.left),
        });
        setShowToolbar(true);
      } catch {
        setShowToolbar(false);
      }
    },
    onBlur() {
      // Delay hiding so toolbar button clicks register first
      setTimeout(() => setShowToolbar(false), 150);
    },
  });

  const charCount = editor?.storage.characterCount.characters() ?? 0;
  const showCounter = charCount >= WARN_CHARS;
  const atLimit = charCount >= MAX_CHARS;
  const remaining = MAX_CHARS - charCount;

  return (
    <div className={className} ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Editor container with always-visible toolbar */}
      <div
        className={`rounded-lg border bg-white transition-colors ${
          atLimit
            ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-400'
            : 'border-gray-300 focus-within:ring-2 focus-within:ring-violet-500 focus-within:border-violet-500'
        }`}
      >
        {/* Always-visible formatting toolbar */}
        {editor && (
          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
              aria-label="Bold"
              aria-pressed={editor.isActive('bold')}
              className={`flex items-center justify-center w-8 h-8 rounded text-sm font-bold transition-colors focus:outline-none ${
                editor.isActive('bold')
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="Bold (Ctrl+B)"
            >
              B
            </button>

            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
              aria-label="Bullet list"
              aria-pressed={editor.isActive('bulletList')}
              className={`flex items-center justify-center w-8 h-8 rounded text-sm transition-colors focus:outline-none ${
                editor.isActive('bulletList')
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="Bullet list"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
                <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </button>

            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}
              aria-label="Heading 3"
              aria-pressed={editor.isActive('heading', { level: 3 })}
              className={`flex items-center justify-center w-8 h-8 rounded text-xs font-bold transition-colors focus:outline-none ${
                editor.isActive('heading', { level: 3 })
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="Heading"
            >
              H3
            </button>
          </div>
        )}

        <EditorContent editor={editor} />
      </div>

      {/* Floating bubble toolbar on text selection (secondary) */}
      {showToolbar && editor && (
        <div
          style={{ position: 'absolute', top: toolbarPos.top, left: toolbarPos.left, zIndex: 50 }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <BubbleToolbar editor={editor} />
        </div>
      )}

      {/* Character counter */}
      <div aria-live="polite" aria-atomic="true" className="mt-1 text-right">
        {showCounter && (
          <span className={`text-xs ${atLimit ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {atLimit ? 'Character limit reached' : `${remaining} character${remaining === 1 ? '' : 's'} remaining`}
          </span>
        )}
      </div>
    </div>
  );
}
