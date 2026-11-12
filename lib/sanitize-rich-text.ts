import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = ['b', 'strong', 'i', 'em', 'a', 'br'];
const ALLOWED_ATTR = ['href', 'target', 'rel'];
const TEXT_NODE = 3;

const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
};

function isAllowedHref(href: string): boolean {
  if (href.startsWith('/')) return true;
  return /^(https?|mailto):/i.test(href);
}

function normalizeAnchor(anchor: Element): void {
  const href = anchor.getAttribute('href');

  if (href === null || !isAllowedHref(href)) {
    anchor.removeAttribute('href');
    anchor.removeAttribute('target');
    anchor.removeAttribute('rel');
    return;
  }

  if (/^https?:/i.test(href)) {
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
    return;
  }

  anchor.removeAttribute('target');
  anchor.removeAttribute('rel');
}

export function sanitizeRichText(html: string): string {
  const body = DOMPurify.sanitize(html, {
    ...RICH_TEXT_CONFIG,
    RETURN_DOM: true,
  }) as Element;

  body.querySelectorAll('a').forEach(normalizeAnchor);

  return body.innerHTML;
}

function collectText(node: Node): string {
  if (node.nodeType === TEXT_NODE) return node.nodeValue ?? '';
  if (node.nodeName === 'BR') return ' ';

  let text = '';
  node.childNodes.forEach((child) => {
    text += collectText(child);
  });
  return text;
}

export function richTextToPlainText(html: string): string {
  const body = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['br'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    RETURN_DOM: true,
  }) as Element;

  return collectText(body).replace(/\s+/g, ' ').trim();
}

export function isRichTextEmpty(html: string): boolean {
  return richTextToPlainText(html) === '';
}
