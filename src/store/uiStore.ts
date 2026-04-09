import { create } from 'zustand';
import type { TabId, Toast } from '@/lib/types';

interface UiStore {
  selectedRequestId: string | null;
  activeTab: TabId;
  splitRatio: number;
  toasts: Toast[];

  selectRequest: (id: string | null) => void;
  setActiveTab: (tab: TabId) => void;
  setSplitRatio: (ratio: number) => void;
  addToast: (t: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  selectedRequestId: null,
  activeTab: 'overview',
  splitRatio: 0.45,
  toasts: [],

  selectRequest: (selectedRequestId) => set({ selectedRequestId }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSplitRatio: (splitRatio) => set({ splitRatio }),

  addToast: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 3500);
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
