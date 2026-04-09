import { useCallback } from 'react';
import { HeadersTable } from './HeadersTable';
import { BodyViewer } from './BodyViewer';
import { getResponseBody } from '@/lib/tauri';
import type { CapturedRequest } from '@/lib/types';

interface Props { request: CapturedRequest; }

export function ResponseTab({ request }: Props) {
  const fetchBody = useCallback(
    () => getResponseBody(request.id),
    [request.id]
  );

  if (request.state === 'pending') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
        Waiting for response...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
          Headers
        </div>
        <HeadersTable headers={request.response_headers ?? []} />
      </div>
      <div style={{ padding: '10px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
          Body {request.response_body_size != null ? `(${request.response_body_size} B)` : ''}
        </div>
        <BodyViewer fetchBody={fetchBody} contentType={request.response_content_type} />
      </div>
    </div>
  );
}
