export type RequestState = 'pending' | 'complete' | 'error';

export interface RequestSummary {
  id: string;
  timestamp: string;
  method: string;
  host: string;
  path: string;
  scheme: string;
  status_code: number | null;
  request_content_type: string | null;
  response_content_type: string | null;
  request_body_size: number;
  response_body_size: number | null;
  duration_ms: number | null;
  state: RequestState;
}

export interface CapturedRequest extends RequestSummary {
  url: string;
  request_headers: [string, string][];
  response_headers: [string, string][] | null;
  tls_version: string | null;
  error: string | null;
}

export interface ResponseUpdate {
  id: string;
  status_code: number | null;
  response_content_type: string | null;
  response_body_size: number | null;
  duration_ms: number | null;
  state: RequestState;
  error: string | null;
}

export interface ProxyStatus {
  running: boolean;
  port: number;
}

export interface CaStatus {
  exists: boolean;
  path: string | null;
}

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

export type TabId = 'overview' | 'request' | 'response' | 'timing';
