import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import type { Note, Project, Task, User } from '../types';
import { formatDueDate } from './dates';
import { htmlToPlainText } from './noteContent';
import { logError } from './firebase';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function noteHtml(n: Note): string {
  const tags = n.tags.length
    ? `<div class="tags">${n.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>`
    : '';
  return `
    <article class="card note">
      <div class="card-hdr">
        <h3>${esc(n.title || 'Untitled')}</h3>
        <span class="meta">${format(new Date(n.updated_at), 'MMM d, yyyy · h:mm a')}</span>
      </div>
      ${tags}
      <div class="body">${esc(htmlToPlainText(n.content) || '(empty)').replace(/\n/g, '<br/>')}</div>
    </article>`;
}

function taskHtml(t: Task): string {
  const due = formatDueDate(t.due_date, 'MMM d, yyyy');
  return `
    <article class="card task">
      <div class="card-hdr">
        <h3>${esc(t.title)}</h3>
        <span class="pill ${t.priority}">${esc(t.priority)}</span>
      </div>
      <p class="sub">${esc(t.status.replace('_', ' '))}${due ? ` · Due ${esc(due)}` : ''}</p>
      ${t.description ? `<p class="body">${esc(t.description)}</p>` : ''}
    </article>`;
}

function projectHtml(p: Project): string {
  const due = formatDueDate(p.due_date, 'MMM d, yyyy');
  return `
    <article class="card project">
      <div class="card-hdr">
        <h3><span class="dot" style="background:${esc(p.color)}"></span>${esc(p.name)}</h3>
        <span class="pill">${esc(p.status.replace('_', ' '))}</span>
      </div>
      ${p.description ? `<p class="body">${esc(p.description)}</p>` : ''}
      ${due ? `<p class="sub">Due ${esc(due)}</p>` : ''}
    </article>`;
}

function buildHtml(params: {
  user?: User | null;
  notes: Note[];
  tasks: Task[];
  projects: Project[];
}): string {
  const { user, notes, tasks, projects } = params;
  const exported = format(new Date(), 'MMMM d, yyyy · h:mm a');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    @page { margin: 28px 32px; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .cover {
      background: linear-gradient(135deg, #0e0e14 0%, #1a1a24 50%, #0f766e 100%);
      color: #f8fafc;
      padding: 36px 32px;
      border-radius: 16px;
      margin-bottom: 28px;
    }
    .cover h1 { margin: 0 0 8px; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
    .cover .accent { color: #5eead4; }
    .cover p { margin: 4px 0; opacity: 0.85; font-size: 14px; }
    .stats {
      display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap;
    }
    .stat {
      background: rgba(94,234,212,0.15);
      border: 1px solid rgba(94,234,212,0.35);
      border-radius: 12px;
      padding: 12px 18px;
      min-width: 90px;
    }
    .stat b { display: block; font-size: 22px; color: #5eead4; }
    .stat span { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }
    section { margin-bottom: 28px; page-break-inside: avoid; }
    h2 {
      font-size: 18px;
      font-weight: 800;
      color: #0f766e;
      border-bottom: 2px solid #5eead4;
      padding-bottom: 8px;
      margin: 0 0 14px;
    }
    .card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 10px;
      box-shadow: 0 2px 8px rgba(15,23,42,0.06);
    }
    .card-hdr { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
    .card h3 { margin: 0; font-size: 15px; font-weight: 700; flex: 1; }
    .meta, .sub { font-size: 11px; color: #64748b; margin: 6px 0 0; }
    .body { font-size: 13px; line-height: 1.55; color: #334155; margin: 8px 0 0; }
    .tags { margin-top: 8px; }
    .tag {
      display: inline-block;
      background: #ecfdf5;
      color: #0f766e;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 20px;
      margin-right: 6px;
    }
    .pill {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      background: #f1f5f9;
      color: #475569;
      padding: 4px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }
    .pill.high { background: #ffe4e6; color: #be123c; }
    .pill.medium { background: #fef9c3; color: #a16207; }
    .pill.low { background: #e0f2fe; color: #0369a1; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 5px; margin-right: 8px; vertical-align: middle; }
    .footer {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    .empty { font-style: italic; color: #94a3b8; font-size: 13px; }
  </style>
</head>
<body>
  <div class="cover">
    <h1>Flowly <span class="accent">Export</span></h1>
    <p>${user?.name ? esc(user.name) + ' · ' : ''}Personal productivity backup</p>
    <p>Generated ${esc(exported)}</p>
    <div class="stats">
      <div class="stat"><b>${notes.length}</b><span>Notes</span></div>
      <div class="stat"><b>${tasks.length}</b><span>Tasks</span></div>
      <div class="stat"><b>${projects.length}</b><span>Projects</span></div>
    </div>
  </div>

  <section>
    <h2>Notes</h2>
    ${notes.length ? notes.map(noteHtml).join('') : '<p class="empty">No notes</p>'}
  </section>

  <section>
    <h2>Tasks</h2>
    ${tasks.length ? tasks.map(taskHtml).join('') : '<p class="empty">No tasks</p>'}
  </section>

  <section>
    <h2>Projects</h2>
    ${projects.length ? projects.map(projectHtml).join('') : '<p class="empty">No projects</p>'}
  </section>

  <div class="footer">Flowly · Offline-first notes, tasks &amp; projects</div>
</body>
</html>`;
}

export async function exportFlowlyPdf(params: {
  user?: User | null;
  notes: Note[];
  tasks: Task[];
  projects: Project[];
}): Promise<void> {
  try {
    const html = buildHtml(params);
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Export Flowly PDF',
    });
  } catch (e) {
    logError(e, 'exportFlowlyPdf');
    throw e;
  }
}
