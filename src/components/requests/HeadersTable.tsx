interface Props {
  headers: [string, string][];
}

export function HeadersTable({ headers }: Props) {
  if (headers.length === 0) {
    return <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>No headers</span>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {headers.map(([k, v], i) => (
        <div key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, color: 'var(--syn-key)', fontFamily: 'monospace', minWidth: 180, flexShrink: 0 }}>
            {k}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}
