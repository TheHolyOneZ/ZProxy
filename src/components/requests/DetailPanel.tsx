import { useEffect, useState } from 'react';
import { Copy, Terminal } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { OverviewTab } from './OverviewTab';
import { RequestTab } from './RequestTab';
import { ResponseTab } from './ResponseTab';
import { TimingTab } from './TimingTab';
import { useUiStore } from '@/store/uiStore';
import { getRequestDetail } from '@/lib/tauri';
import { copyAsCurl } from '@/lib/curl';
import type { CapturedRequest, TabId } from '@/lib/types';

interface Props { requestId: string; }

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'request',  label: 'Request'  },
  { id: 'response', label: 'Response' },
  { id: 'timing',   label: 'Timing'   },
];

const actionBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5,
  padding: '0 10px', height: 26, borderRadius: 5, fontSize: 11,
  color: 'var(--text-muted)', background: 'var(--surface-input)',
  border: '1px solid var(--border)', transition: 'all 100ms',
};

export function DetailPanel({ requestId }: Props) {
  const activeTab    = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const addToast     = useUiStore((s) => s.addToast);
  const [detail, setDetail] = useState<CapturedRequest | null>(null);

  useEffect(() => {
    setDetail(null);
    getRequestDetail(requestId)
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [requestId]);

  const handleCopyCurl = async () => {
    try {
      await copyAsCurl(requestId);
      addToast({ type: 'success', message: 'cURL command copied to clipboard' });
    } catch (e) {
      addToast({ type: 'error', message: String(e) });
    }
  };

  const handleCopyUrl = async () => {
    if (detail) {
      await navigator.clipboard.writeText(detail.url);
      addToast({ type: 'info', message: 'URL copied' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingRight: 10, borderBottom: '1px solid var(--border)', flexShrink: 0,
        background: 'var(--surface)',
      }}>
        <Tabs tabs={TABS} active={activeTab} onChange={(id) => setActiveTab(id as TabId)} />

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={handleCopyUrl}
            title="Copy URL"
            style={actionBtn}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Copy size={11} /> URL
          </button>
          <button
            onClick={handleCopyCurl}
            title="Copy as cURL"
            style={actionBtn}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Terminal size={11} /> cURL
          </button>
        </div>
      </div>

      {!detail ? (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: 12, gap: 8,
        }}>
          <span style={{ opacity: 0.4, fontSize: 18 }}>⋯</span>
          Loading
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'overview'  && <OverviewTab request={detail} />}
          {activeTab === 'request'   && <RequestTab  request={detail} />}
          {activeTab === 'response'  && <ResponseTab request={detail} />}
          {activeTab === 'timing'    && <TimingTab   request={detail} />}
        </div>
      )}
    </div>
  );
}
