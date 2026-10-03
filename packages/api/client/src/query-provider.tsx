import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { createQueryClient, setGlobalQueryClient } from "./query-client";

let clientSingleton: QueryClient | null = null;

function getClientClient(): QueryClient {
  if (typeof window === "undefined") {
    return createQueryClient();
  }
  if (!clientSingleton) {
    clientSingleton = createQueryClient();
  }
  return clientSingleton;
}

export function QueryProvider({
  children,
  client: externalClient,
}: {
  children: React.ReactNode;
  client?: QueryClient;
}) {
  const queryClient = externalClient ?? getClientClient();

  useEffect(() => {
    setGlobalQueryClient(queryClient);
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
