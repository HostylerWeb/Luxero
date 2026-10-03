import { create } from "zustand";

type TurnstileStatus = "idle" | "success" | "error" | "fail";

interface TurnstileState {
  status: TurnstileStatus;
  token: string | null;
  setSuccess: (token: string) => void;
  setError: () => void;
  setFail: () => void;
  reset: () => void;
  consume: () => void;
}

export const useTurnstileStore = create<TurnstileState>((set) => ({
  status: "idle",
  token: null,
  setSuccess: (token) => set({ status: "success", token }),
  setError: () => set({ status: "error", token: null }),
  setFail: () => set({ status: "fail", token: null }),
  reset: () => set({ status: "idle", token: null }),
  consume: () => set({ status: "idle", token: null }),
}));

export function useTurnstile() {
  const status = useTurnstileStore((s) => s.status);
  const token = useTurnstileStore((s) => s.token);

  return {
    status,
    token: status === "success" ? token : null,
    isDisabled: status !== "success",
  };
}
