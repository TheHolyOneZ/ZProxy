import { create } from 'zustand';
import type { RequestSummary, ResponseUpdate } from '@/lib/types';

interface ProxyStore {
  running: boolean;
  port: number;
  requests: RequestSummary[];
  search: string;
  methodFilter: string | null;
  statusFilter: string | null;
  hostFilter: string | null;
  autoScroll: boolean;

  setRunning: (v: boolean) => void;
  setPort: (v: number) => void;
  addRequest: (r: RequestSummary) => void;
  updateRequest: (u: ResponseUpdate) => void;
  clearRequests: () => void;
  setSearch: (v: string) => void;
  setMethodFilter: (v: string | null) => void;
  setStatusFilter: (v: string | null) => void;
  setHostFilter: (v: string | null) => void;
  toggleAutoScroll: () => void;
}

export const useProxyStore = create<ProxyStore>((set) => ({
  running: false,
  port: 8080,
  requests: [],
  search: '',
  methodFilter: null,
  statusFilter: null,
  hostFilter: null,
  autoScroll: true,

  setRunning: (running) => set({ running }),
  setPort: (port) => set({ port }),

  addRequest: (r) =>
    set((s) => ({ requests: [...s.requests, r] })),

  updateRequest: (u) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === u.id
          ? {
              ...r,
              status_code: u.status_code,
              response_content_type: u.response_content_type,
              response_body_size: u.response_body_size,
              duration_ms: u.duration_ms,
              state: u.state,
            }
          : r
      ),
    })),

  clearRequests: () => set({ requests: [] }),
  setSearch: (search) => set({ search }),
  setMethodFilter: (methodFilter) => set({ methodFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setHostFilter: (hostFilter) => set({ hostFilter }),
  toggleAutoScroll: () => set((s) => ({ autoScroll: !s.autoScroll })),
}));
