import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sanitizeHtml, ALLOWED_TAGS } from './sanitizeHtml';

// Helper: extract all tag names from an HTML string using DOMParser
function extractTagNames(html: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = doc.body.querySelectorAll('*');
  return Array.from(elements).map((el) => el.tagName.toLowerCase());
}

// Helper: check if any element in an HTML string has attributes
function hasAttributes(html: string): boolean {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const elements = doc.body.querySelectorAll('*');
  return Array.from(elements).some((el) => el.attributes.length > 0);
}

// Helper: strip all tags and return plain text
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

const allowedTagSet = new Set(ALLOWED_TAGS as unknown as string[]);

describe('sanitizeHtml', () => {
  // Feature: service-description-rich-editor, Property 1: Sanitizer output contains only allowed tags and no attributes
  it('Property 1: output contains only allowed tags and no attributes', () => {
    fc.assert(
      fc.property(
        // Generate strings that may contain HTML-like content
        fc.string({ minLength: 0, maxLength: 200 }),
        (input) => {
          // Inject some disallowed tags and attributes to make the test meaningful
          const dirty = `<div style="color:red"><em>${input}</em><script>alert(1)</script><p class="foo">text</p></div>`;
          const result = sanitizeHtml(dirty);

          if (result === null) return true; // null is valid for empty content

          // All tags in output must be in ALLOWED_TAGS
          const tags = extractTagNames(result);
          const allAllowed = tags.every((tag) => allowedTagSet.has(tag));

          // No element should have any attributes
          const noAttrs = !hasAttributes(result);

          return allAllowed && noAttrs;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: service-description-rich-editor, Property 2: Sanitizer returns null for empty or whitespace-only content
  it('Property 2: returns null for empty or whitespace-only content', () => {
    fc.assert(
      fc.property(
        // Generate whitespace-only strings using array of whitespace chars
        fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 0, maxLength: 20 })
          .map((chars) => chars.join('')),
        (whitespace) => {
          expect(sanitizeHtml(whitespace)).toBeNull();
          // Also test wrapped in tags that get stripped
          expect(sanitizeHtml(`<div>${whitespace}</div>`)).toBeNull();
          expect(sanitizeHtml(`<span>${whitespace}</span>`)).toBeNull();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: service-description-rich-editor, Property 3: Sanitizer idempotence
  it('Property 3: sanitizeHtml is idempotent', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 300 }),
        (input) => {
          const dirty = `<p><strong>${input}</strong></p><ul><li>${input}</li></ul>`;
          const once = sanitizeHtml(dirty);
          const twice = once !== null ? sanitizeHtml(once) : null;
          expect(once).toEqual(twice);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Specific examples
  it('strips disallowed tags but preserves inner text', () => {
    const result = sanitizeHtml('<div><em>hello</em></div>');
    expect(result).not.toContain('<div');
    expect(result).not.toContain('<em');
    expect(result).toContain('hello');
  });

  it('strips all attributes from allowed tags', () => {
    const result = sanitizeHtml('<p class="foo" style="color:red">text</p>');
    expect(result).not.toContain('class=');
    expect(result).not.toContain('style=');
    expect(result).toContain('<p>');
    expect(result).toContain('text');
  });

  it('returns null for empty string', () => {
    expect(sanitizeHtml('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(sanitizeHtml('   \n\t  ')).toBeNull();
  });

  it('returns null for tags with only whitespace content', () => {
    expect(sanitizeHtml('<p>   </p>')).toBeNull();
  });

  it('preserves allowed tags: p, strong, ul, li, br, h3', () => {
    const input = '<p>text</p><strong>bold</strong><ul><li>item</li></ul><h3>heading</h3>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
    expect(result).toContain('<h3>');
  });

  it('strips script tags and preserves their text', () => {
    const result = sanitizeHtml('<p>safe</p><script>alert("xss")</script>');
    expect(result).not.toContain('<script');
    expect(result).toContain('safe');
  });
});
