import { useAuth } from "@luxero/api-client";
import type { User } from "@luxero/types";

export function useUser(): User | null {
  const { user: authUser } = useAuth();
  return authUser;
}
