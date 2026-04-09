import { Play, Square, Trash2, Search, X } from 'lucide-react';
import { useProxyStore } from '@/store/proxyStore';
import { useUiStore } from '@/store/uiStore';
import { startProxy, stopProxy, clearRequests as clearRequestsCmd } from '@/lib/tauri';

const selectStyle = (active: boolean): React.CSSProperties => ({
  padding: '4px 8px', borderRadius: 6, fontSize: 12,
  background: active ? 'var(--accent-sub)' : 'var(--surface-input)',
  border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
  color: active ? 'var(--accent)' : 'var(--text-muted)',
  cursor: 'pointer', fontWeight: active ? 600 : 400,
  transition: 'all 120ms',
  height: 28,
});

export function Toolbar() {
  const running       = useProxyStore((s) => s.running);
  const port          = useProxyStore((s) => s.port);
  const requests      = useProxyStore((s) => s.requests);
  const search        = useProxyStore((s) => s.search);
  const methodFilter  = useProxyStore((s) => s.methodFilter);
  const statusFilter  = useProxyStore((s) => s.statusFilter);
  const setPort       = useProxyStore((s) => s.setPort);
  const setSearch     = useProxyStore((s) => s.setSearch);
  const setMethodFilter = useProxyStore((s) => s.setMethodFilter);
  const setStatusFilter = useProxyStore((s) => s.setStatusFilter);
  const clearRequests = useProxyStore((s) => s.clearRequests);
  const setRunning    = useProxyStore((s) => s.setRunning);
  const addToast      = useUiStore((s) => s.addToast);

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

  const methods  = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  const statuses = ['2xx', '3xx', '4xx', '5xx'];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      flexShrink: 0, height: 42,
    }}>
      <button
        onClick={handleToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px',
          height: 28, borderRadius: 6, fontSize: 12, fontWeight: 600,
          background: running ? 'var(--red-sub)' : 'var(--accent)',
          color: running ? 'var(--red)' : '#fff',
          border: running ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
          transition: 'all 120ms', flexShrink: 0,
        }}
      >
        {running
          ? <Square size={11} fill="currentColor" />
          : <Play size={12} fill="currentColor" />}
        {running ? 'Stop' : 'Start'}
      </button>

      <div style={{ width: 1, height: 18, background: 'var(--border)', flexShrink: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', userSelect: 'none' }}>Port</span>
        <div
          className="input-wrap"
          style={{
            display: 'flex', alignItems: 'center',
            padding: '0 8px', height: 28, borderRadius: 6, width: 64,
            background: 'var(--surface-input)', border: '1px solid var(--border)',
            transition: 'border-color 120ms, box-shadow 120ms',
          }}
        >
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
            disabled={running}
            min={1}
            max={65535}
            style={{
              width: '100%', fontSize: 12, textAlign: 'center',
              color: running ? 'var(--text-muted)' : 'var(--text)',
            }}
          />
        </div>
      </div>

      <div style={{ width: 1, height: 18, background: 'var(--border)', flexShrink: 0 }} />
      <div className="input-wrap" style={{
        borderRadius: 6, border: `1px solid ${methodFilter ? 'var(--accent-border)' : 'var(--border)'}`,
        transition: 'border-color 120ms, box-shadow 120ms',
      }}>
        <select
          value={methodFilter ?? ''}
          onChange={(e) => setMethodFilter(e.target.value || null)}
          style={selectStyle(!!methodFilter)}
        >
          <option value="">Method</option>
          {methods.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="input-wrap" style={{
        borderRadius: 6, border: `1px solid ${statusFilter ? 'var(--accent-border)' : 'var(--border)'}`,
        transition: 'border-color 120ms, box-shadow 120ms',
      }}>
        <select
          value={statusFilter ?? ''}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          style={selectStyle(!!statusFilter)}
        >
          <option value="">Status</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ width: 1, height: 18, background: 'var(--border)', flexShrink: 0 }} />
      <div
        className="input-wrap"
        style={{
          display: 'flex', alignItems: 'center', gap: 6, flex: 1,
          padding: '0 10px', height: 28, borderRadius: 6,
          background: 'var(--surface-input)', border: '1px solid var(--border)',
          transition: 'border-color 120ms, box-shadow 120ms',
        }}
      >
        <Search size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search URLs…"
          style={{ flex: 1, fontSize: 12, color: 'var(--text)' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={11} />
          </button>
        )}
      </div>
      <span style={{
        fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap',
        padding: '0 8px', height: 28, borderRadius: 6,
        background: 'var(--surface-input)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', flexShrink: 0,
      }}>
        {requests.length.toLocaleString()} req{requests.length !== 1 ? 's' : ''}
      </span>
      <button
        onClick={handleClear}
        title="Clear all"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 6, flexShrink: 0,
          background: 'var(--surface-input)', border: '1px solid var(--border)',
          color: 'var(--text-dim)', transition: 'all 120ms',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--red)';
          e.currentTarget.style.background = 'var(--red-sub)';
          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-dim)';
          e.currentTarget.style.background = 'var(--surface-input)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
