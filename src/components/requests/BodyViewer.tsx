import { useState, useEffect } from 'react';
import { colorizeJson, prettifyJson, bytesToText } from '@/lib/format';

interface Props {
  fetchBody: () => Promise<number[]>;
  contentType: string | null;
}

const MAX_DISPLAY = 1024 * 1024;

export function BodyViewer({ fetchBody, contentType }: Props) {
  const [body, setBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBody(null);
    setError(null);
    setLoading(true);
    fetchBody()
      .then((bytes) => {
        if (bytes.length > MAX_DISPLAY) {
          setError(`Body too large to display (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`);
          return;
        }
        setBody(bytesToText(bytes));
      })
      .catch(() => setError('No body'))
      .finally(() => setLoading(false));
  }, [fetchBody]);

  if (loading) return (
    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loading...</span>
  );
  if (error) return (
    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>{error}</span>
  );
  if (!body || body.length === 0) return (
    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty body</span>
  );

  const isJson = contentType?.includes('json') || body.trimStart().startsWith('{') || body.trimStart().startsWith('[');

  const rendered = isJson ? colorizeJson(prettifyJson(body)) : body;

  return (
    <pre
      dangerouslySetInnerHTML={isJson ? { __html: rendered } : undefined}
      style={{
        fontSize: 11, fontFamily: 'monospace', lineHeight: 1.6,
        color: 'var(--text-dim)', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        overflowY: 'auto', maxHeight: '100%',
      }}
    >
      {!isJson ? body : undefined}
    </pre>
  );
}
