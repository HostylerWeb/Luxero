import { create } from "zustand";

interface TemplateDrawerState {
  isOpen: boolean;
  editingId: string | null;
  preselectedPrize: { _id: string; title: string; value?: number; images: string[] } | null;
  open: (
    preselectedPrize?: { _id: string; title: string; value?: number; images: string[] } | null
  ) => void;
  edit: (id: string) => void;
  close: () => void;
}

export const useBonusAwardTemplateDrawerStore = create<TemplateDrawerState>((set) => ({
  isOpen: false,
  editingId: null,
  preselectedPrize: null,
  open: (preselectedPrize = null) => set({ isOpen: true, editingId: null, preselectedPrize }),
  edit: (id) => set({ isOpen: true, editingId: id, preselectedPrize: null }),
  close: () => set({ isOpen: false, editingId: null, preselectedPrize: null }),
}));

interface AssignmentDrawerState {
  isOpen: boolean;
  competitionId: string | null;
  editingAssignmentId: string | null;
  preselectedBonusAwardId: string | null;
  maxTickets: number;
  ticketsSold: number;
  open: (params: {
    competitionId: string;
    maxTickets?: number;
    ticketsSold?: number;
    preselectedBonusAwardId?: string;
  }) => void;
  edit: (params: {
    assignmentId: string;
    competitionId: string;
    maxTickets?: number;
    ticketsSold?: number;
  }) => void;
  close: () => void;
}

export const useBonusAwardAssignmentDrawerStore = create<AssignmentDrawerState>((set) => ({
  isOpen: false,
  competitionId: null,
  editingAssignmentId: null,
  preselectedBonusAwardId: null,
  maxTickets: 0,
  ticketsSold: 0,
  open: ({ competitionId, maxTickets = 0, ticketsSold = 0, preselectedBonusAwardId }) =>
    set({
      isOpen: true,
      competitionId,
      maxTickets,
      ticketsSold,
      preselectedBonusAwardId,
      editingAssignmentId: null,
    }),
  edit: ({ assignmentId, competitionId, maxTickets = 0, ticketsSold = 0 }) =>
    set({
      isOpen: true,
      editingAssignmentId: assignmentId,
      competitionId,
      maxTickets,
      ticketsSold,
      preselectedBonusAwardId: null,
    }),
  close: () => set({ isOpen: false, editingAssignmentId: null, preselectedBonusAwardId: null }),
}));
