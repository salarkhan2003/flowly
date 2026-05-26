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
  | 'divider'
  | 'link';

export function applyFormat(
  content: string,
  selection: { start: number; end: number },
  action: FormatAction
): { text: string; selection: { start: number; end: number } } {
  const start = Math.max(0, selection.start);
  const end = Math.max(start, selection.end);
  const selected = content.slice(start, end);
  const before = content.slice(0, start);
  const after = content.slice(end);

  let wrapped = selected;
  let cursorStart = start;
  let cursorEnd = end;

  switch (action) {
    case 'bold':
      wrapped = selected ? `**${selected}**` : '**bold text**';
      break;
    case 'italic':
      wrapped = selected ? `*${selected}*` : '*italic text*';
      break;
    case 'h1':
      wrapped = selected ? `# ${selected}` : '# Heading';
      break;
    case 'h2':
      wrapped = selected ? `## ${selected}` : '## Subheading';
      break;
    case 'bullet':
      wrapped = selected
        ? selected.split('\n').map((l) => `- ${l}`).join('\n')
        : '- List item';
      break;
    case 'number':
      wrapped = selected
        ? selected.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n')
        : '1. List item';
      break;
    case 'quote':
      wrapped = selected
        ? selected.split('\n').map((l) => `> ${l}`).join('\n')
        : '> Quote';
      break;
    case 'checkbox':
      wrapped = selected
        ? selected.split('\n').map((l) => `- [ ] ${l}`).join('\n')
        : '- [ ] Todo item';
      break;
    case 'code':
      wrapped = selected ? `\`${selected}\`` : '`code`';
      break;
    case 'divider':
      wrapped = '\n---\n';
      break;
    case 'link':
      wrapped = selected ? `[${selected}](url)` : '[link text](https://)';
      break;
    default:
      return { text: content, selection };
  }

  const text = before + wrapped + after;
  cursorStart = before.length;
  cursorEnd = cursorStart + wrapped.length;
  return { text, selection: { start: cursorStart, end: cursorEnd } };
}

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export function countChars(text: string): number {
  return text.length;
}
