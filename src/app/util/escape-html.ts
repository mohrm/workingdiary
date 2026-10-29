// Escapes user-provided values before they are interpolated into
// innerHTML templates, so activity names or URL parameters cannot inject
// markup (CodeQL: DOM text reinterpreted as HTML / XSS).
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
