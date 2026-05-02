import type { Editor } from '@tiptap/react';

interface BubbleToolbarProps {
  editor: Editor;
}

/**
 * Floating toolbar rendered inside Tiptap's BubbleMenu.
 * Appears only when text is selected. Contains Bold, Bullet List, and Heading H3 controls.
 * All buttons have aria-label and aria-pressed for accessibility.
 */
export function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const buttonBase =
    'flex items-center justify-center w-8 h-8 rounded text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500';
  const activeClass = 'bg-violet-100 text-violet-700';
  const inactiveClass = 'text-gray-600 hover:bg-gray-100';

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg shadow-lg"
      role="toolbar"
      aria-label="Text formatting"
    >
      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
        aria-pressed={editor.isActive('bold')}
        className={`${buttonBase} ${editor.isActive('bold') ? activeClass : inactiveClass}`}
      >
        <strong>B</strong>
      </button>

      {/* Bullet List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet list"
        aria-pressed={editor.isActive('bulletList')}
        className={`${buttonBase} ${editor.isActive('bulletList') ? activeClass : inactiveClass}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="9" y1="6" x2="20" y2="6" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <line x1="9" y1="18" x2="20" y2="18" />
          <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {/* Heading H3 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        aria-label="Heading 3"
        aria-pressed={editor.isActive('heading', { level: 3 })}
        className={`${buttonBase} ${editor.isActive('heading', { level: 3 }) ? activeClass : inactiveClass}`}
      >
        <span className="text-xs font-bold">H3</span>
      </button>
    </div>
  );
}
