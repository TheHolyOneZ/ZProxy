import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type {
  CaStatus,
  CapturedRequest,
  ProxyStatus,
  RequestSummary,
  ResponseUpdate,
} from './types';

export const startProxy = (port: number) =>
  invoke<void>('start_proxy', { port });

export const stopProxy = () => invoke<void>('stop_proxy');

export const getProxyStatus = () => invoke<ProxyStatus>('get_proxy_status');

export const getRequests = () => invoke<RequestSummary[]>('get_requests');

export const getRequestDetail = (id: string) =>
  invoke<CapturedRequest>('get_request_detail', { id });

export const getRequestBody = (id: string) =>
  invoke<number[]>('get_request_body', { id });

export const getResponseBody = (id: string) =>
  invoke<number[]>('get_response_body', { id });

export const clearRequests = () => invoke<void>('clear_requests');

export const exportAsCurl = (id: string) =>
  invoke<string>('export_as_curl', { id });

export const generateCa = () => invoke<string>('generate_ca');

export const installCa = () => invoke<void>('install_ca');

export const getCaStatus = () => invoke<CaStatus>('get_ca_status');

export const onProxyRequest = (cb: (r: RequestSummary) => void) =>
  listen<RequestSummary>('proxy-request', (e) => cb(e.payload));

export const onProxyResponse = (cb: (u: ResponseUpdate) => void) =>
  listen<ResponseUpdate>('proxy-response', (e) => cb(e.payload));

export const onProxyStarted = (cb: (port: number) => void) =>
  listen<{ port: number }>('proxy-started', (e) => cb(e.payload.port));

export const onProxyStopped = (cb: () => void) =>
  listen<void>('proxy-stopped', () => cb());
