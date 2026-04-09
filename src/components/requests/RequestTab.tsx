import { useCallback } from 'react';
import { HeadersTable } from './HeadersTable';
import { BodyViewer } from './BodyViewer';
import { getRequestBody } from '@/lib/tauri';
import type { CapturedRequest } from '@/lib/types';

interface Props { request: CapturedRequest; }

export function RequestTab({ request }: Props) {
  const fetchBody = useCallback(
    () => getRequestBody(request.id),
    [request.id]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
          Headers
        </div>
        <HeadersTable headers={request.request_headers} />
      </div>
      <div style={{ padding: '10px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
          Body {request.request_body_size > 0 ? `(${request.request_body_size} B)` : ''}
        </div>
        <BodyViewer fetchBody={fetchBody} contentType={request.request_content_type} />
      </div>
    </div>
  );
}
