import { useEffect, useRef, useMemo } from 'react';
import { Radio } from 'lucide-react';
import { useProxyStore } from '@/store/proxyStore';
import { useUiStore } from '@/store/uiStore';
import { RequestRow } from './RequestRow';

const HEADER_HEIGHT = 28;

export function RequestList() {
  const requests   = useProxyStore((s) => s.requests);
  const search     = useProxyStore((s) => s.search);
  const methodFilter = useProxyStore((s) => s.methodFilter);
  const statusFilter = useProxyStore((s) => s.statusFilter);
  const hostFilter   = useProxyStore((s) => s.hostFilter);
  const autoScroll   = useProxyStore((s) => s.autoScroll);
  const selectedId   = useUiStore((s) => s.selectedRequestId);
  const selectRequest = useUiStore((s) => s.selectRequest);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (search && !`${r.host}${r.path}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (methodFilter && r.method !== methodFilter) return false;
      if (statusFilter && r.status_code) {
        const prefix = Math.floor(r.status_code / 100);
        if (statusFilter !== `${prefix}xx`) return false;
      }
      if (hostFilter && r.host !== hostFilter) return false;
      return true;
    });
  }, [requests, search, methodFilter, statusFilter, hostFilter]);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [filtered.length, autoScroll]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{
        height: HEADER_HEIGHT, display: 'grid',
        gridTemplateColumns: '10px 56px 1fr 1fr 46px 58px 54px',
        alignItems: 'center', gap: 8, padding: '0 10px',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div />
        {[
          { label: 'Method', align: 'left' },
          { label: 'Host',   align: 'left' },
          { label: 'Path',   align: 'left' },
          { label: 'Status', align: 'left' },
          { label: 'Size',   align: 'right' },
          { label: 'Time',   align: 'right' },
        ].map((col) => (
          <span key={col.label} style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'var(--text-muted)',
            textAlign: col.align as 'left' | 'right',
          }}>
            {col.label}
          </span>
        ))}
      </div>

      <div
        ref={containerRef}
        style={{ flex: 1, overflowY: 'auto' }}
      >
        {filtered.length === 0 ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: 12, flexDirection: 'column', gap: 8,
          }}>
            <Radio size={22} color="var(--text-muted)" />
            <span>{requests.length === 0 ? 'Start the proxy and send requests' : 'No results match your filter'}</span>
          </div>
        ) : (
          filtered.map((r, i) => (
            <RequestRow
              key={r.id}
              request={r}
              selected={r.id === selectedId}
              zebra={i % 2 === 1}
              onClick={() => selectRequest(r.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
