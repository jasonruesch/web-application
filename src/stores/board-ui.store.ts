import { create } from 'zustand';
import type { TaskPriority } from '~/types';

interface BoardFilters {
  query: string;
  assigneeId: string | null;
  priority: TaskPriority | null;
}

interface BoardUiState {
  filters: BoardFilters;
  setQuery: (query: string) => void;
  setAssignee: (assigneeId: string | null) => void;
  setPriority: (priority: TaskPriority | null) => void;
  reset: () => void;
}

const emptyFilters: BoardFilters = {
  query: '',
  assigneeId: null,
  priority: null,
};

/** Transient board UI state (filters). Not persisted — resets per session. */
export const useBoardUiStore = create<BoardUiState>((set) => ({
  filters: emptyFilters,
  setQuery: (query) => set((s) => ({ filters: { ...s.filters, query } })),
  setAssignee: (assigneeId) =>
    set((s) => ({ filters: { ...s.filters, assigneeId } })),
  setPriority: (priority) =>
    set((s) => ({ filters: { ...s.filters, priority } })),
  reset: () => set({ filters: emptyFilters }),
}));
