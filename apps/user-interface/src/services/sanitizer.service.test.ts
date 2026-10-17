import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  sanitizePlainText,
  validateSafeFilename,
  escapeScriptInterpolation,
  MAX_UPLOAD_FILE_SIZE_BYTES,
} from './sanitizer.service';

describe('Sanitizer Service (DevSecOps Hardening)', () => {
  describe('sanitizeHtml', () => {
    it('strips <script> tags and malicious inline scripts', () => {
      const malicious = 'Hello <script>alert("pwned")</script> World';
      const clean = sanitizeHtml(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
      expect(clean).toContain('Hello  World');
    });

    it('strips onerror and onload event handlers from <img> or <svg>', () => {
      const malicious = '<img src="invalid.jpg" onerror="alert(document.cookie)" alt="Test" />';
      const clean = sanitizeHtml(malicious);
      expect(clean).not.toContain('onerror');
      expect(clean).not.toContain('alert');
      expect(clean).toContain('<img');
      expect(clean).toContain('alt="Test"');
    });

    it('removes javascript: URI schemes from links', () => {
      const malicious = '<a href="javascript:alert(1)">Click here</a>';
      const clean = sanitizeHtml(malicious);
      expect(clean).not.toContain('javascript:');
      expect(clean).not.toContain('alert');
    });

    it('adds target="_blank" and rel="noopener noreferrer" to external links', () => {
      const input = '<a href="https://example.com">Visit</a>';
      const clean = sanitizeHtml(input);
      expect(clean).toContain('target="_blank"');
      expect(clean).toContain('rel="noopener noreferrer"');
    });

    it('strips dangerous tags like <iframe>, <object>, and <embed>', () => {
      const malicious = '<iframe src="https://evil.com"></iframe><object data="test"></object>';
      const clean = sanitizeHtml(malicious);
      expect(clean).not.toContain('<iframe');
      expect(clean).not.toContain('<object');
    });

    it('preserves legitimate safe markdown formatting tags', () => {
      const safe = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> and <code>code</code></p>';
      const clean = sanitizeHtml(safe);
      expect(clean).toBe(safe);
    });

    it('handles empty input gracefully', () => {
      expect(sanitizeHtml('')).toBe('');
    });
  });

  describe('sanitizePlainText', () => {
    it('escapes HTML special characters', () => {
      const raw = '<b>Test & "quote" \'single\' <script></b>';
      const escaped = sanitizePlainText(raw);
      expect(escaped).toBe('&lt;b&gt;Test &amp; &quot;quote&quot; &#039;single&#039; &lt;script&gt;&lt;/b&gt;');
    });

    it('handles empty text', () => {
      expect(sanitizePlainText('')).toBe('');
    });
  });

  describe('validateSafeFilename', () => {
    it('approves legitimate filenames with allowed extensions', () => {
      expect(validateSafeFilename('document.txt').isValid).toBe(true);
      expect(validateSafeFilename('my-notes.md').isValid).toBe(true);
      expect(validateSafeFilename('script_1.js').isValid).toBe(true);
    });

    it('rejects filenames exceeding 64 characters', () => {
      const longName = 'a'.repeat(61) + '.txt'; // 65 chars
      const res = validateSafeFilename(longName);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('cannot exceed 64 characters');
    });

    it('blocks directory traversal attempts (..)', () => {
      const res = validateSafeFilename('../../etc/passwd.txt');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('directory traversal');
    });

    it('blocks forward and backward slashes (/ and \\)', () => {
      expect(validateSafeFilename('sub/file.txt').isValid).toBe(false);
      expect(validateSafeFilename('sub\\file.txt').isValid).toBe(false);
    });

    it('blocks prototype pollution keys (__proto__, constructor, prototype)', () => {
      expect(validateSafeFilename('__proto__.txt').isValid).toBe(false);
      expect(validateSafeFilename('constructor.md').isValid).toBe(false);
      expect(validateSafeFilename('prototype.js').isValid).toBe(false);
    });

    it('blocks forbidden control characters and null bytes', () => {
      expect(validateSafeFilename('file\0name.txt').isValid).toBe(false);
      expect(validateSafeFilename('file\nname.txt').isValid).toBe(false);
    });

    it('rejects unsupported extensions', () => {
      const res = validateSafeFilename('script.py');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Only .txt, .md, and .js are supported');
    });

    it('rejects empty or whitespace-only filenames', () => {
      expect(validateSafeFilename('').isValid).toBe(false);
      expect(validateSafeFilename('   ').isValid).toBe(false);
    });
  });

  describe('escapeScriptInterpolation', () => {
    it('escapes closing </script> tags case-insensitively', () => {
      const code = 'const x = "</script><script>alert(1)</SCRIPT>";';
      const escaped = escapeScriptInterpolation(code);
      expect(escaped).not.toContain('</script>');
      expect(escaped).not.toContain('</SCRIPT>');
      expect(escaped).toContain('<\\/script>');
    });

    it('returns empty string on empty input', () => {
      expect(escapeScriptInterpolation('')).toBe('');
    });
  });

  describe('MAX_UPLOAD_FILE_SIZE_BYTES', () => {
    it('is set to 512 KB', () => {
      expect(MAX_UPLOAD_FILE_SIZE_BYTES).toBe(524288);
    });
  });
});
