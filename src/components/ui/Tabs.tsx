interface Tab {
  id: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexShrink: 0 }}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '0 16px', height: 36, fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              background: isActive ? 'var(--accent-sub)' : 'transparent',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              borderRadius: isActive ? '4px 4px 0 0' : 0,
              transition: 'color 100ms, background 100ms',
              letterSpacing: isActive ? '-0.01em' : 0,
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-dim)'; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
