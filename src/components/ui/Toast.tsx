import { X } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

export function ToastContainer() {
  const toasts     = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 16,
      display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1000,
      pointerEvents: 'none',
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 8, fontSize: 12,
          background: 'var(--surface)', border: '1px solid var(--border)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          pointerEvents: 'all',
          borderLeft: `3px solid ${t.type === 'error' ? 'var(--red)' : t.type === 'success' ? 'var(--green)' : 'var(--accent)'}`,
        }}>
          <span style={{ color: 'var(--text)' }}>{t.message}</span>
          <button onClick={() => removeToast(t.id)} style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
