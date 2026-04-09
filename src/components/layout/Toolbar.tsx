import { Play, Square, Trash2, Search, X } from 'lucide-react';
import { useProxyStore } from '@/store/proxyStore';
import { useUiStore } from '@/store/uiStore';
import { startProxy, stopProxy, clearRequests as clearRequestsCmd } from '@/lib/tauri';

export function Toolbar() {
  const running    = useProxyStore((s) => s.running);
  const port       = useProxyStore((s) => s.port);
  const requests   = useProxyStore((s) => s.requests);
  const search     = useProxyStore((s) => s.search);
  const methodFilter = useProxyStore((s) => s.methodFilter);
  const statusFilter = useProxyStore((s) => s.statusFilter);
  const setPort    = useProxyStore((s) => s.setPort);
  const setSearch  = useProxyStore((s) => s.setSearch);
  const setMethodFilter = useProxyStore((s) => s.setMethodFilter);
  const setStatusFilter = useProxyStore((s) => s.setStatusFilter);
  const clearRequests   = useProxyStore((s) => s.clearRequests);
  const setRunning = useProxyStore((s) => s.setRunning);
  const addToast   = useUiStore((s) => s.addToast);

  const handleToggle = async () => {
    try {
      if (running) {
        await stopProxy();
        setRunning(false);
        addToast({ type: 'info', message: 'Proxy stopped' });
      } else {
        await startProxy(port);
        setRunning(true);
        addToast({ type: 'success', message: `Proxy running on :${port}` });
      }
    } catch (e) {
      addToast({ type: 'error', message: String(e) });
    }
  };

  const handleClear = async () => {
    await clearRequestsCmd();
    clearRequests();
  };

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  const statuses = ['2xx', '3xx', '4xx', '5xx'];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
      background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0,
    }}>
      <button
        onClick={handleToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px',
          borderRadius: 6, fontSize: 13, fontWeight: 600,
          background: running ? 'var(--red-sub)' : 'var(--accent)',
          color: running ? 'var(--red)' : '#fff',
          border: running ? '1px solid rgba(239,68,68,0.3)' : 'none',
          transition: 'all 100ms',
        }}
      >
        {running ? <Square size={12} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
        {running ? 'Stop' : 'Start'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Port</span>
        <input
          type="number"
          value={port}
          onChange={(e) => setPort(Number(e.target.value))}
          disabled={running}
          min={1}
          max={65535}
          style={{
            width: 60, padding: '4px 6px', borderRadius: 5, fontSize: 12,
            background: 'var(--surface-input)', border: '1px solid var(--border)',
            color: running ? 'var(--text-muted)' : 'var(--text)',
            textAlign: 'center',
          }}
        />
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

      <select
        value={methodFilter ?? ''}
        onChange={(e) => setMethodFilter(e.target.value || null)}
        style={{
          padding: '4px 8px', borderRadius: 5, fontSize: 12,
          background: 'var(--surface-input)', border: '1px solid var(--border)',
          color: methodFilter ? 'var(--text)' : 'var(--text-muted)',
          cursor: 'pointer',
        }}
      >
        <option value="">Method</option>
        {methods.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>

      <select
        value={statusFilter ?? ''}
        onChange={(e) => setStatusFilter(e.target.value || null)}
        style={{
          padding: '4px 8px', borderRadius: 5, fontSize: 12,
          background: 'var(--surface-input)', border: '1px solid var(--border)',
          color: statusFilter ? 'var(--text)' : 'var(--text-muted)',
          cursor: 'pointer',
        }}
      >
        <option value="">Status</option>
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, flex: 1,
        padding: '5px 10px', borderRadius: 6,
        background: 'var(--surface-input)', border: '1px solid var(--border)',
      }}>
        <Search size={12} color="var(--text-muted)" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search URLs..."
          style={{ flex: 1, fontSize: 12, color: 'var(--text)' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}><X size={11} /></button>
        )}
      </div>

      <span style={{
        fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap',
        padding: '3px 8px', borderRadius: 5, background: 'var(--surface-input)',
        border: '1px solid var(--border)',
      }}>
        {requests.length} req{requests.length !== 1 ? 's' : ''}
      </span>

      <button
        onClick={handleClear}
        title="Clear all"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 30, height: 30, borderRadius: 6,
          background: 'var(--surface-input)', border: '1px solid var(--border)',
          color: 'var(--text-dim)', transition: 'all 100ms',
        }}
        onMouseEnter={(e) => { (e.currentTarget.style.color = 'var(--red)'); (e.currentTarget.style.background = 'var(--red-sub)'); }}
        onMouseLeave={(e) => { (e.currentTarget.style.color = 'var(--text-dim)'); (e.currentTarget.style.background = 'var(--surface-input)'); }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
