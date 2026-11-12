import { sanitizeRichText, richTextToPlainText, isRichTextEmpty } from '@/lib/sanitize-rich-text';

it('keeps the allowlist', () => {
  expect(sanitizeRichText('<b>a</b> <strong>b</strong> <i>c</i> <em>d</em><br>')).toBe('<b>a</b> <strong>b</strong> <i>c</i> <em>d</em><br>');
});

it('strips scripts, styles, and event handlers', () => {
  const out = sanitizeRichText('<script>alert(1)</script><p style="color:red" onclick="x()">hi</p>');
  expect(out).not.toContain('script');
  expect(out).not.toContain('onclick');
  expect(out).not.toContain('style');
  expect(out).toContain('hi');
});

it('drops javascript: and data: links but keeps https and relative', () => {
  expect(sanitizeRichText('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:');
  expect(sanitizeRichText('<a href="data:text/html,x">x</a>')).not.toContain('data:');
  expect(sanitizeRichText('<a href="https://viztr.com">x</a>')).toContain('href="https://viztr.com"');
  expect(sanitizeRichText('<a href="/portfolio">x</a>')).toContain('href="/portfolio"');
});

it('normalizes external links', () => {
  const out = sanitizeRichText('<a href="https://example.com">x</a>');
  expect(out).toContain('target="_blank"');
  expect(out).toContain('rel="noopener noreferrer"');
});

it('extracts plain text and detects empty', () => {
  expect(richTextToPlainText('<b>Hello</b> <i>world</i>')).toBe('Hello world');
  expect(isRichTextEmpty('<br>')).toBe(true);
  expect(isRichTextEmpty('<b> </b>')).toBe(true);
  expect(isRichTextEmpty('<b>x</b>')).toBe(false);
});
