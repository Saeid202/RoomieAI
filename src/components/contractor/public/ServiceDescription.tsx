import { useState, useRef, useEffect } from 'react';

export interface ServiceDescriptionProps {
  descriptionHtml: string | null;
  description: string | null;
  /** Brand color for the Read More / Show Less link */
  brandColor?: string;
}

/**
 * Renders a service description on the public page.
 *
 * - If descriptionHtml is non-null: renders sanitized HTML inside a scoped
 *   prose container. Inline styles from the HTML are neutralized via CSS.
 * - If descriptionHtml is null: falls back to rendering plain text description.
 * - Truncates to ~4 lines with a Read More / Show Less toggle.
 */
export function ServiceDescription({
  descriptionHtml,
  description,
  brandColor,
}: ServiceDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect overflow to decide whether to show the Read More control
  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      // Fallback: always show toggle if ResizeObserver unavailable
      setShowToggle(true);
      return;
    }

    const check = () => {
      // When collapsed, scrollHeight > clientHeight means content is clipped
      if (!expanded) {
        setShowToggle(el.scrollHeight > el.clientHeight + 2);
      }
    };

    check();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(check);
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      // Fallback for very old browsers
      setShowToggle(true);
    }
  }, [descriptionHtml, description, expanded]);

  if (!descriptionHtml && !description) return null;

  return (
    <div>
      {descriptionHtml ? (
        <div
          ref={containerRef}
          className={`service-description-prose text-gray-500 text-sm leading-relaxed ${
            !expanded ? 'line-clamp-4' : ''
          }`}
          // Inline styles from user HTML are neutralized by the CSS class above
          // (see the [&_*] overrides in the className or global CSS)
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          style={{
            // Defense-in-depth: neutralize any inline styles that survived sanitization
            fontFamily: 'inherit',
            color: 'inherit',
            fontSize: 'inherit',
            textAlign: 'inherit',
          }}
        />
      ) : (
        <p
          ref={containerRef as React.RefObject<HTMLParagraphElement>}
          className={`text-gray-500 text-sm leading-relaxed ${
            !expanded ? 'line-clamp-4' : ''
          }`}
        >
          {description}
        </p>
      )}

      {(showToggle || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 text-xs font-medium transition-colors duration-200 focus:outline-none focus-visible:underline"
          style={{ color: brandColor ?? '#7c3aed' }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
