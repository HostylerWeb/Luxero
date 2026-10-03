import { create } from "zustand";

export interface CompetitionsFilterStore {
  search: string;
  category: string | null;
  status: string | null;
  setSearch: (search: string) => void;
  setCategory: (category: string | null) => void;
  setStatus: (status: string | null) => void;
  initFromUrl: () => void;
  syncUrl: () => void;
}

export const useCompetitionsFilterStore = create<CompetitionsFilterStore>((set, get) => ({
  search: "",
  category: null,
  status: null,

  setSearch: (search) => {
    set({ search });
  },

  setCategory: (category) => {
    set({ category });
    get().syncUrl();
  },

  setStatus: (status) => {
    set({ status });
    get().syncUrl();
  },

  initFromUrl: () => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    set({
      search: sp.get("search") ?? "",
      category: sp.get("category") ?? null,
      status: sp.get("status") ?? null,
    });
  },

  syncUrl: () => {
    const { search, category, status } = get();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `?${qs}` : window.location.pathname);
  },
}));
