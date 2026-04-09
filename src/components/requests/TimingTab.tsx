import { formatDuration } from '@/lib/format';
import type { CapturedRequest } from '@/lib/types';

interface Props { request: CapturedRequest; }

export function TimingTab({ request }: Props) {
  if (request.state === 'pending') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
        Waiting for response...
      </div>
    );
  }

  const total = request.duration_ms ?? 0;

  return (
    <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Total Duration</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>
          {formatDuration(total)}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ height: 12, borderRadius: 6, background: 'var(--surface-input)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{
            height: '100%', borderRadius: 6,
            background: 'linear-gradient(90deg, var(--accent), var(--teal))',
            width: '100%',
            transition: 'width 400ms ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Request sent</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Response received</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total request time</span>
          <span style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'monospace' }}>{formatDuration(total)}</span>
        </div>
        {request.tls_version && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>TLS version</span>
            <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'monospace' }}>{request.tls_version}</span>
          </div>
        )}
      </div>
    </div>
  );
}
