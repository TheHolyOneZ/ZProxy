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
    ? 'rgba(255,255,255,0.018)'
    : 'transparent';

  const isPending = request.state === 'pending';

  return (
    <div
      onClick={onClick}
      style={{
        height: ROW_HEIGHT, display: 'grid',
        gridTemplateColumns: '10px 56px 1fr 1fr 46px 58px 54px',
        alignItems: 'center', gap: 8, padding: '0 10px',
        background: bg,
        borderLeft: selected ? '2px solid var(--accent)' : '2px solid transparent',
        cursor: 'pointer', transition: 'background 80ms',
        opacity: isPending ? 0.55 : 1,
      }}
      onMouseEnter={(e) => { if (!selected) (e.currentTarget.style.background = 'rgba(255,255,255,0.04)'); }}
      onMouseLeave={(e) => { if (!selected) (e.currentTarget.style.background = bg); }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: dotColor,
        flexShrink: 0, display: 'inline-block',
        boxShadow: !isPending && request.status_code && request.status_code < 400
          ? `0 0 5px ${dotColor}70` : 'none',
        transition: 'box-shadow 200ms',
      }} />

      <MethodBadge method={request.method} />
      <span style={{
        fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace',
      }}>
        {request.host}
      </span>
      <span style={{
        fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace',
      }}>
        {request.path}
      </span>

      <StatusBadge code={request.status_code} />

      <span style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', fontFamily: 'monospace' }}>
        {request.response_body_size != null ? formatBytes(request.response_body_size) : '—'}
      </span>

      <span style={{
        fontSize: 10, textAlign: 'right', fontFamily: 'monospace',
        color: request.duration_ms != null
          ? request.duration_ms > 1000 ? 'var(--amber)' : request.duration_ms > 500 ? 'var(--text-dim)' : 'var(--text-muted)'
          : 'var(--text-muted)',
      }}>
        {formatDuration(request.duration_ms)}
      </span>
    </div>
  );
}

export { ROW_HEIGHT };
