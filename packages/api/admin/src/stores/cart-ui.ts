import { create } from "zustand";

interface CartUiState {
  dismissedAdjustmentIds: Set<string>;
  lastDiscountError: string | null;
  lastDiscountSuccess: boolean;
}

interface CartUiActions {
  dismissAdjustment: (id: string) => void;
  clearDismissed: () => void;
  isDismissed: (id: string) => boolean;
  setDiscountError: (error: string | null) => void;
  setDiscountSuccess: (success: boolean) => void;
}

export type CartUiStore = CartUiState & CartUiActions;

export const useCartUiStore = create<CartUiStore>((set, get) => ({
  dismissedAdjustmentIds: new Set<string>(),
  lastDiscountError: null,
  lastDiscountSuccess: false,

  dismissAdjustment: (id) => {
    set((state) => {
      if (state.dismissedAdjustmentIds.has(id)) return state;
      const next = new Set(state.dismissedAdjustmentIds);
      next.add(id);
      return { dismissedAdjustmentIds: next };
    });
  },

  clearDismissed: () => {
    set({ dismissedAdjustmentIds: new Set<string>() });
  },

  isDismissed: (id) => get().dismissedAdjustmentIds.has(id),

  setDiscountError: (error) => {
    set({ lastDiscountError: error });
  },

  setDiscountSuccess: (success) => {
    set({ lastDiscountSuccess: success });
  },
}));
