import { MethodBadge, StatusBadge } from '@/components/ui/Badge';
import { formatBytes, formatDuration } from '@/lib/format';
import type { CapturedRequest } from '@/lib/types';

interface Props { request: CapturedRequest; }

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 120, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--text-dim)', wordBreak: 'break-all' }}>{children}</span>
    </div>
  );
}

export function OverviewTab({ request }: Props) {
  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', flex: 1 }}>
      <Row label="URL">
        <span style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{request.url}</span>
      </Row>
      <Row label="Method"><MethodBadge method={request.method} /></Row>
      <Row label="Status">
        <StatusBadge code={request.status_code} />
        {request.state === 'pending' && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Pending...</span>
        )}
        {request.state === 'error' && (
          <span style={{ fontSize: 11, color: 'var(--red)', marginLeft: 8 }}>{request.error}</span>
        )}
      </Row>
      <Row label="Duration">{formatDuration(request.duration_ms)}</Row>
      <Row label="Request Size">{formatBytes(request.request_body_size)}</Row>
      <Row label="Response Size">{formatBytes(request.response_body_size)}</Row>
      {request.tls_version && <Row label="TLS">{request.tls_version}</Row>}
      <Row label="Scheme">
        <span style={{ color: request.scheme === 'https' ? 'var(--green)' : 'var(--text-muted)' }}>
          {request.scheme.toUpperCase()}
        </span>
      </Row>
      <Row label="Timestamp">{request.timestamp}</Row>
    </div>
  );
}
