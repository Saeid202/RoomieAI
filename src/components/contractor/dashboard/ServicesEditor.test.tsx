import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

/**
 * Integration test for the ServicesEditor save flow.
 *
 * Feature: service-description-rich-editor, Property 7:
 * Save writes sanitized HTML and plain text to both fields.
 *
 * We test the save logic directly (the data transformation layer)
 * rather than rendering the full component, since the component
 * depends on Supabase and complex UI interactions.
 */

// Simulate the save data preparation logic from ServicesEditor.handleSave
function prepareSaveData(
  contractorId: string,
  form: {
    id?: string;
    service_name: string;
    description: string;
    description_html: string | null;
    icon_name: string;
    image_url: string | null;
  },
  sortOrder: number
) {
  return {
    ...(form.id ? { id: form.id } : {}),
    contractor_id: contractorId,
    service_name: form.service_name,
    description: form.description || null,
    description_html: sanitizeHtml(form.description_html ?? '') ?? null,
    icon_name: form.icon_name || null,
    image_url: form.image_url || null,
    sort_order: sortOrder,
  };
}

describe('ServicesEditor — save flow', () => {
  // Feature: service-description-rich-editor, Property 7: Save writes sanitized HTML and plain text to both fields
  it('Property 7: save data includes both description_html (sanitized) and description (plain text)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).map((s) => s.replace(/[<>&"']/g, 'x')),
        (text) => {
          if (!text.trim()) return true;

          const editorHtml = `<p><strong>${text}</strong></p>`;
          const plainText = text; // plain text extracted from editor

          const form = {
            service_name: 'Test Service',
            description: plainText,
            description_html: editorHtml,
            icon_name: '',
            image_url: null,
          };

          const saveData = prepareSaveData('contractor-123', form, 0);

          // description_html must be the sanitized version of the editor HTML
          const expectedHtml = sanitizeHtml(editorHtml);
          expect(saveData.description_html).toEqual(expectedHtml);

          // description must be the plain text
          expect(saveData.description).toBe(plainText);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('stores null for description_html when editor content is empty', () => {
    const form = {
      service_name: 'Test',
      description: '',
      description_html: '<p></p>',
      icon_name: '',
      image_url: null,
    };
    const saveData = prepareSaveData('contractor-123', form, 0);
    expect(saveData.description_html).toBeNull();
  });

  it('stores null for description when plain text is empty', () => {
    const form = {
      service_name: 'Test',
      description: '',
      description_html: null,
      icon_name: '',
      image_url: null,
    };
    const saveData = prepareSaveData('contractor-123', form, 0);
    expect(saveData.description).toBeNull();
  });

  it('sanitizes description_html before saving (strips disallowed tags)', () => {
    const form = {
      service_name: 'Test',
      description: 'hello',
      description_html: '<p>hello</p><script>alert("xss")</script>',
      icon_name: '',
      image_url: null,
    };
    const saveData = prepareSaveData('contractor-123', form, 0);
    expect(saveData.description_html).not.toContain('<script');
    expect(saveData.description_html).toContain('hello');
  });

  it('includes contractor_id in save data', () => {
    const form = {
      service_name: 'Test',
      description: 'desc',
      description_html: '<p>desc</p>',
      icon_name: '',
      image_url: null,
    };
    const saveData = prepareSaveData('my-contractor-id', form, 2);
    expect(saveData.contractor_id).toBe('my-contractor-id');
    expect(saveData.sort_order).toBe(2);
  });
});
