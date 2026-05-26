/** Helpers for note body (HTML editor + legacy markdown). */

export type FormatAction =
  | 'bold'
  | 'italic'
  | 'h1'
  | 'h2'
  | 'bullet'
  | 'number'
  | 'quote'
  | 'checkbox'
  | 'code'
  | 'link'
  | 'divider';

export function looksLikeHtml(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

/** Convert stored body to HTML for the rich editor. */
export function toEditorHtml(content: string): string {
  if (!content?.trim()) return '';
  if (looksLikeHtml(content)) return content;
  return markdownToHtml(content);
}

export function markdownToHtml(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  html = html.replace(/\*(.+?)\*/g, '<i>$1</i>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<div class="check"><input type="checkbox" disabled> $1</div>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/\n---\n/g, '<hr/>');
  html = html.replace(/\n/g, '<br/>');

  return html;
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function countWordsFromHtml(html: string): number {
  const t = htmlToPlainText(html);
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export function countCharsFromHtml(html: string): number {
  return htmlToPlainText(html).length;
}

/** Map toolbar action → document.execCommand */
export function formatCommand(action: FormatAction): { command: string; value?: string } {
  switch (action) {
    case 'bold':
      return { command: 'bold' };
    case 'italic':
      return { command: 'italic' };
    case 'h1':
      return { command: 'formatBlock', value: 'h1' };
    case 'h2':
      return { command: 'formatBlock', value: 'h2' };
    case 'bullet':
      return { command: 'insertUnorderedList' };
    case 'number':
      return { command: 'insertOrderedList' };
    case 'quote':
      return { command: 'formatBlock', value: 'blockquote' };
    case 'code':
      return { command: 'formatBlock', value: 'pre' };
    case 'link':
      return { command: 'createLink', value: 'https://' };
    case 'divider':
      return { command: 'insertHorizontalRule' };
    case 'checkbox':
      return { command: 'insertHTML', value: '<div class="check"><input type="checkbox"> </div>' };
    default:
      return { command: 'bold' };
  }
}
