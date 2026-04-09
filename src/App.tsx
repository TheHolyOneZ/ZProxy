import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Titlebar } from '@/components/layout/Titlebar';
import { Toolbar } from '@/components/layout/Toolbar';
import { StatusBar } from '@/components/layout/StatusBar';
import { RequestList } from '@/components/requests/RequestList';
import { DetailPanel } from '@/components/requests/DetailPanel';
import { SplitPane } from '@/components/ui/SplitPane';
import { ToastContainer } from '@/components/ui/Toast';
import { useProxyStore } from '@/store/proxyStore';
import { useUiStore } from '@/store/uiStore';
import {
  onProxyRequest,
  onProxyResponse,
  onProxyStarted,
  onProxyStopped,
} from '@/lib/tauri';

export default function App() {
  const addRequest    = useProxyStore((s) => s.addRequest);
  const updateRequest = useProxyStore((s) => s.updateRequest);
  const setRunning    = useProxyStore((s) => s.setRunning);
  const setPort       = useProxyStore((s) => s.setPort);
  const selectedId    = useUiStore((s) => s.selectedRequestId);

  useEffect(() => {
    const prevent = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', prevent);
    return () => document.removeEventListener('contextmenu', prevent);
  }, []);

  useEffect(() => {
    const unlisteners = [
      onProxyRequest((r) => addRequest(r)),
      onProxyResponse((u) => updateRequest(u)),
      onProxyStarted((port) => { setRunning(true); setPort(port); }),
      onProxyStopped(() => setRunning(false)),
    ];

    return () => {
      unlisteners.forEach((p) => p.then((fn) => fn()));
    };
  }, [addRequest, updateRequest, setRunning, setPort]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Titlebar />
      <Toolbar />

      <SplitPane
        left={<RequestList />}
        right={
          selectedId ? (
            <DetailPanel requestId={selectedId} />
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', fontSize: 12, flexDirection: 'column', gap: 8,
            }}>
              <ArrowLeft size={20} color="var(--text-muted)" />
              <span>Select a request to inspect</span>
            </div>
          )
        }
      />

      <StatusBar />
      <ToastContainer />
    </div>
  );
}
