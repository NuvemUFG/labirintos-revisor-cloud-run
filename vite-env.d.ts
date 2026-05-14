export interface LinkCheckResult {
  url: string;
  ok: boolean;
  status?: number;
  statusText?: string;
  checkedAt: string;
  error?: string;
  method: 'HEAD' | 'GET' | 'blocked';
}

export function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s)\]}>"]+/g) ?? [];
  return Array.from(new Set(matches.map((u) => u.replace(/[.,;:]+$/g, ''))));
}

export async function checkUrlInBrowser(url: string): Promise<LinkCheckResult> {
  const checkedAt = new Date().toISOString();
  try {
    const res = await fetch(url, { method: 'HEAD', mode: 'cors', redirect: 'follow' });
    return { url, ok: res.ok, status: res.status, statusText: res.statusText, checkedAt, method: 'HEAD' };
  } catch (headError) {
    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors', redirect: 'follow' });
      return { url, ok: res.ok, status: res.status, statusText: res.statusText, checkedAt, method: 'GET' };
    } catch (getError) {
      return {
        url,
        ok: false,
        checkedAt,
        method: 'blocked',
        error: 'Falha no navegador ou bloqueio CORS. Para relatório formal, use: npm run linkcheck.'
      };
    }
  }
}

export async function checkUrl(url: string): Promise<LinkCheckResult> {
  try {
    const res = await fetch('/api/check-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (res.ok) {
      return await res.json() as LinkCheckResult;
    }
  } catch {
    // Fallback to browser check below.
  }
  return checkUrlInBrowser(url);
}

export function linkResultsToCsv(results: LinkCheckResult[]) {
  const header = 'url,ok,status,statusText,method,checkedAt,error';
  const lines = results.map((r) => [r.url, String(r.ok), String(r.status ?? ''), r.statusText ?? '', r.method, r.checkedAt, r.error ?? '']
    .map((v) => `"${v.replace(/"/g, '""')}"`).join(','));
  return [header, ...lines].join('\n');
}
