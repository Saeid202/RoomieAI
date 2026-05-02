import DOMPurify from 'dompurify';

/**
 * Allowed HTML tags for service descriptions.
 * All other tags are stripped; their inner text content is preserved.
 */
export const ALLOWED_TAGS = ['p', 'strong', 'ul', 'li', 'br', 'h3'] as const;

/**
 * Sanitizes an HTML string for safe storage and rendering.
 *
 * - Strips all tags not in ALLOWED_TAGS (preserving inner text via KEEP_CONTENT)
 * - Strips all HTML attributes (no class, style, id, data-*, href, etc.)
 * - Returns null when the sanitized output is empty or whitespace-only
 * - Returns null in SSR / unsupported environments (no DOM available)
 *
 * @param dirty - Raw HTML string from the Tiptap editor
 * @returns Sanitized HTML string, or null if empty/unsupported
 */
export function sanitizeHtml(dirty: string): string | null {
  // Guard: SSR or environments where DOMPurify cannot run
  if (typeof window === 'undefined' || !DOMPurify.isSupported) {
    return null;
  }

  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [],      // strip all attributes
    KEEP_CONTENT: true,    // preserve inner text of stripped tags
  });

  // Normalize: treat whitespace-only result as null
  const plainText = clean.replace(/<[^>]*>/g, '').trim();
  if (!plainText) return null;

  return clean;
}
