import { MethodBadge, StatusBadge } from '@/components/ui/Badge';
import { formatBytes, formatDuration, statusColor } from '@/lib/format';
import type { RequestSummary } from '@/lib/types';

const ROW_HEIGHT = 32;

interface Props {
  request: RequestSummary;
  selected: boolean;
  zebra: boolean;
  onClick: () => void;
}

export function RequestRow({ request, selected, zebra, onClick }: Props) {
  const dotColor = request.state === 'pending'
    ? 'var(--text-muted)'
    : request.state === 'error'
    ? 'var(--red)'
    : statusColor(request.status_code);

  const bg = selected
    ? 'var(--accent-sub)'
    : zebra
    ? 'rgba(255,255,255,0.015)'
    : 'transparent';

  return (
    <div
      onClick={onClick}
      style={{
        height: ROW_HEIGHT, display: 'grid',
        gridTemplateColumns: '10px 52px 1fr 1fr 44px 60px 56px',
        alignItems: 'center', gap: 8, padding: '0 10px',
        background: bg,
        borderLeft: selected ? '2px solid var(--accent)' : '2px solid transparent',
        cursor: 'pointer', transition: 'background 80ms',
        opacity: request.state === 'pending' ? 0.6 : 1,
      }}
      onMouseEnter={(e) => { if (!selected) (e.currentTarget.style.background = 'var(--surface-hover)'); }}
      onMouseLeave={(e) => { if (!selected) (e.currentTarget.style.background = bg); }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: dotColor,
        flexShrink: 0, display: 'inline-block',
        boxShadow: request.state === 'complete' && request.status_code && request.status_code < 300
          ? `0 0 4px ${dotColor}80` : 'none',
      }} />

      <MethodBadge method={request.method} />

      <span style={{
        fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace',
      }}>
        {request.host}
      </span>

      <span style={{
        fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace',
      }}>
        {request.path}
      </span>

      <StatusBadge code={request.status_code} />

      <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', fontFamily: 'monospace' }}>
        {formatBytes(request.response_body_size)}
      </span>

      <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', fontFamily: 'monospace' }}>
        {formatDuration(request.duration_ms)}
      </span>
    </div>
  );
}

export { ROW_HEIGHT };
