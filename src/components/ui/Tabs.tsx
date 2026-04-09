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
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '8px 14px', fontSize: 12, fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, transition: 'color 100ms',
            }}
            onMouseEnter={(e) => { if (!isActive) (e.currentTarget.style.color = 'var(--text-dim)'); }}
            onMouseLeave={(e) => { if (!isActive) (e.currentTarget.style.color = 'var(--text-muted)'); }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
