import { useProxyStore } from '@/store/proxyStore';
import { useUiStore } from '@/store/uiStore';

export function StatusBar() {
  const running    = useProxyStore((s) => s.running);
  const port       = useProxyStore((s) => s.port);
  const requests   = useProxyStore((s) => s.requests);
  const selectedId = useUiStore((s) => s.selectedRequestId);
  const selected   = requests.find((r) => r.id === selectedId);

  return (
    <div style={{
      height: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 12px', background: 'var(--surface)', borderTop: '1px solid var(--border)',
      flexShrink: 0, fontSize: 11, color: 'var(--text-muted)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
          background: running ? 'var(--green)' : 'var(--text-muted)',
          boxShadow: running ? '0 0 4px var(--green)' : 'none',
          transition: 'all 300ms',
        }} />
        <span>
          {running ? `Running on :${port}` : 'Stopped'}
        </span>
        <span style={{ color: 'var(--border-strong)' }}>·</span>
        <span>{requests.length} request{requests.length !== 1 ? 's' : ''}</span>
      </div>

      {selected && (
        <span style={{ color: 'var(--text-dim)', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected.method} {selected.scheme}://{selected.host}{selected.path}
        </span>
      )}
    </div>
  );
}
