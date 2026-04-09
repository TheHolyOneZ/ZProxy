export function formatBytes(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour12: false });
}

export function methodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':     return 'var(--method-get)';
    case 'POST':    return 'var(--method-post)';
    case 'PUT':     return 'var(--method-put)';
    case 'DELETE':  return 'var(--method-delete)';
    case 'PATCH':   return 'var(--method-patch)';
    case 'HEAD':    return 'var(--method-head)';
    default:        return 'var(--method-options)';
  }
}

export function statusColor(code: number | null): string {
  if (code === null) return 'var(--text-muted)';
  if (code < 300) return 'var(--status-2xx)';
  if (code < 400) return 'var(--status-3xx)';
  if (code < 500) return 'var(--status-4xx)';
  return 'var(--status-5xx)';
}

export function prettifyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function colorizeJson(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          return `<span style="color:var(--syn-key)">${match}</span>`;
        }
        return `<span style="color:var(--syn-string)">${match}</span>`;
      }
      if (/true|false/.test(match)) {
        return `<span style="color:var(--syn-bool)">${match}</span>`;
      }
      if (/null/.test(match)) {
        return `<span style="color:var(--syn-null)">${match}</span>`;
      }
      return `<span style="color:var(--syn-number)">${match}</span>`;
    }
  );
}

export function bytesToText(bytes: number[]): string {
  return new TextDecoder().decode(new Uint8Array(bytes));
}
