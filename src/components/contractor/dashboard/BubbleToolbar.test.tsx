import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { BubbleToolbar } from './BubbleToolbar';
import type { Editor } from '@tiptap/react';

/**
 * Creates a minimal mock Editor with configurable isActive state.
 */
function createMockEditor(activeMarks: Record<string, boolean> = {}): Editor {
  return {
    isActive: (markOrNode: string, attrs?: Record<string, unknown>) => {
      if (markOrNode === 'heading' && attrs?.level === 3) {
        return activeMarks['heading'] ?? false;
      }
      return activeMarks[markOrNode] ?? false;
    },
    chain: () => ({
      focus: () => ({
        toggleBold: () => ({ run: vi.fn() }),
        toggleBulletList: () => ({ run: vi.fn() }),
        toggleHeading: () => ({ run: vi.fn() }),
      }),
    }),
  } as unknown as Editor;
}

describe('BubbleToolbar', () => {
  // Feature: service-description-rich-editor, Property 9: All Bubble toolbar buttons have non-empty aria-label
  it('Property 9: all buttons have non-empty aria-label', () => {
    const editor = createMockEditor();
    render(<BubbleToolbar editor={editor} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((btn) => {
      const label = btn.getAttribute('aria-label');
      expect(label).toBeTruthy();
      expect(label!.trim().length).toBeGreaterThan(0);
    });
  });

  // Feature: service-description-rich-editor, Property 8: Bubble toolbar aria-pressed reflects active mark state
  it('Property 8: aria-pressed reflects active mark state for bold', () => {
    fc.assert(
      fc.property(fc.boolean(), (boldActive) => {
        const editor = createMockEditor({ bold: boldActive });
        const { unmount } = render(<BubbleToolbar editor={editor} />);
        const boldBtn = screen.getByRole('button', { name: 'Bold' });
        expect(boldBtn.getAttribute('aria-pressed')).toBe(String(boldActive));
        unmount();
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('Property 8: aria-pressed reflects active mark state for bullet list', () => {
    fc.assert(
      fc.property(fc.boolean(), (bulletActive) => {
        const editor = createMockEditor({ bulletList: bulletActive });
        const { unmount } = render(<BubbleToolbar editor={editor} />);
        const bulletBtn = screen.getByRole('button', { name: 'Bullet list' });
        expect(bulletBtn.getAttribute('aria-pressed')).toBe(String(bulletActive));
        unmount();
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('Property 8: aria-pressed reflects active mark state for heading H3', () => {
    fc.assert(
      fc.property(fc.boolean(), (headingActive) => {
        const editor = createMockEditor({ heading: headingActive });
        const { unmount } = render(<BubbleToolbar editor={editor} />);
        const headingBtn = screen.getByRole('button', { name: 'Heading 3' });
        expect(headingBtn.getAttribute('aria-pressed')).toBe(String(headingActive));
        unmount();
        return true;
      }),
      { numRuns: 10 }
    );
  });

  it('renders exactly 3 buttons', () => {
    const editor = createMockEditor();
    render(<BubbleToolbar editor={editor} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('applies active styling when bold is active', () => {
    const editor = createMockEditor({ bold: true });
    render(<BubbleToolbar editor={editor} />);
    const boldBtn = screen.getByRole('button', { name: 'Bold' });
    expect(boldBtn.className).toContain('bg-violet-100');
    expect(boldBtn.className).toContain('text-violet-700');
  });

  it('applies inactive styling when bold is not active', () => {
    const editor = createMockEditor({ bold: false });
    render(<BubbleToolbar editor={editor} />);
    const boldBtn = screen.getByRole('button', { name: 'Bold' });
    expect(boldBtn.className).toContain('text-gray-600');
  });
});
