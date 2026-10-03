import { create } from "zustand";

export type AuthStatus = "loading" | "authenticated" | "anonymous" | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  displayName: string;
  initials: string;
}

export const useSessionStore = create<AuthState>(() => ({
  status: "loading",
  displayName: "",
  initials: "",
}));

export function setSessionAuthenticated(displayName: string, initials: string) {
  useSessionStore.setState({ status: "authenticated", displayName, initials });
}
export function setSessionAnonymous() {
  useSessionStore.setState({ status: "anonymous", displayName: "", initials: "" });
}
export function setSessionUnauthenticated() {
  useSessionStore.setState({ status: "unauthenticated", displayName: "", initials: "" });
}
