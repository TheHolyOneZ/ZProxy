import { methodColor, statusColor } from '@/lib/format';

export function MethodBadge({ method }: { method: string }) {
  const color = methodColor(method);
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
      padding: '1px 5px', borderRadius: 4,
      color, background: `${color}18`,
      border: `1px solid ${color}30`,
      fontFamily: 'monospace',
    }}>
      {method}
    </span>
  );
}

export function StatusBadge({ code }: { code: number | null }) {
  if (code === null) return (
    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>—</span>
  );
  const color = statusColor(code);
  return (
    <span style={{ fontSize: 12, color, fontWeight: 600, fontFamily: 'monospace' }}>
      {code}
    </span>
  );
}
