export function downloadTextFile(filename: string, text: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function toMarkdownTable(rows: Array<Record<string, string>>) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const header = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${headers.map((h) => String(row[h] ?? '').replace(/\|/g, '\\|')).join(' | ')} |`).join('\n');
  return `${header}\n${sep}\n${body}`;
}

export function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}
