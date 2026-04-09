import { useRef, useCallback } from 'react';
import { useUiStore } from '@/store/uiStore';

interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function SplitPane({ left, right }: Props) {
  const ratio    = useUiStore((s) => s.splitRatio);
  const setRatio = useUiStore((s) => s.setSplitRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const r = Math.min(0.8, Math.max(0.15, (e.clientX - rect.left) / rect.width));
      setRatio(r);
    };

    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [setRatio]);

  return (
    <div ref={containerRef} style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={{ width: `${ratio * 100}%`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {left}
      </div>

      <div
        onMouseDown={onMouseDown}
        style={{
          width: 4, flexShrink: 0, background: 'var(--border)',
          cursor: 'col-resize', transition: 'background 100ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-border)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--border)')}
      />

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {right}
      </div>
    </div>
  );
}
