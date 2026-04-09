import { useProxyStore } from '@/store/proxyStore';
import { useUiStore } from '@/store/uiStore';

export function StatusBar() {
  const running    = useProxyStore((s) => s.running);
  const port       = useProxyStore((s) => s.port);
  const requests   = useProxyStore((s) => s.requests);
  const search     = useProxyStore((s) => s.search);
  const methodFilter = useProxyStore((s) => s.methodFilter);
  const statusFilter = useProxyStore((s) => s.statusFilter);
  const selectedId = useUiStore((s) => s.selectedRequestId);
  const selected   = requests.find((r) => r.id === selectedId);

  const hasFilter  = !!(search || methodFilter || statusFilter);

  return (
    <div style={{
      height: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 12px', background: 'var(--surface)', borderTop: '1px solid var(--border)',
      flexShrink: 0, fontSize: 11, color: 'var(--text-muted)', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span style={{
          display: 'inline-block', width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: running ? 'var(--green)' : 'var(--text-muted)',
          boxShadow: running ? '0 0 6px var(--green)' : 'none',
          transition: 'all 300ms',
        }} />
        <span style={{ whiteSpace: 'nowrap' }}>
          {running
            ? <><span style={{ color: 'var(--text-dim)' }}>Running on</span>{' '}
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>:{port}</span></>
            : 'Stopped'}
        </span>
        <span style={{ color: 'var(--border-strong)' }}>·</span>
        <span style={{ whiteSpace: 'nowrap' }}>
          {requests.length.toLocaleString()}
          {' '}request{requests.length !== 1 ? 's' : ''}
        </span>
        {hasFilter && (
          <>
            <span style={{ color: 'var(--border-strong)' }}>·</span>
            <span style={{ color: 'var(--accent)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              filtered
            </span>
          </>
        )}
      </div>
      {selected && (
        <span style={{
          color: 'var(--text-dim)', maxWidth: 480,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: 'monospace', fontSize: 10,
        }}>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'inherit' }}>
            {selected.method}
          </span>
          {' '}
          {selected.scheme}://{selected.host}{selected.path}
        </span>
      )}
    </div>
  );
}
