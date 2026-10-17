import DOMPurify from 'dompurify';

/**
 * Maximum permitted file size in bytes for client-side uploads (512 KB)
 * Protects against memory exhaustion and Denial of Service (DoS).
 */
export const MAX_UPLOAD_FILE_SIZE_BYTES = 512 * 1024;

/**
 * Configures DOMPurify hooks to ensure all external links have target="_blank" and rel="noopener noreferrer".
 */
let isHookConfigured = false;
function ensureDomPurifyHooks(): void {
  if (isHookConfigured) return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  isHookConfigured = true;
}

/**
 * Sanitizes raw HTML generated from Markdown or user input.
 * Strips script tags, iframes, inline event handlers (onerror, onload, onclick, etc.),
 * and dangerous URI schemes (javascript:, vbscript:, data:).
 *
 * @param dirtyHtml - Unsanitized HTML string
 * @returns Clean, safe HTML string
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';
  ensureDomPurifyHooks();

  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'b', 'i', 'strong', 'em',
      'strike', 'code', 'hr', 'br', 'ul', 'ol', 'li', 'blockquote', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'img', 'del', 'sup', 'sub',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'style', 'width', 'height'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'style', 'meta', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
}

/**
 * Sanitizes plain text content by escaping HTML control entities to prevent DOM-based XSS.
 *
 * @param text - Plain text input
 * @returns Escaped safe text string
 */
export function sanitizePlainText(text: string): string {
  if (!text) return '';
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export { validateSafeFilename } from '#stores/filesystem.store';

/**
 * Escapes script tags within interpolated JavaScript strings to prevent premature tag closing
 * and template breakout inside isolated sandboxed iframes.
 *
 * @param code - Raw user JavaScript source code
 * @returns Escaped code safe for interpolation inside <script> tags
 */
export function escapeScriptInterpolation(code: string): string {
  if (!code) return '';
  return code.replaceAll(/<\/script>/gi, '<\\/script>');
}
