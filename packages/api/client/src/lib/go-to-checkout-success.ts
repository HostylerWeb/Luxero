import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "../keys";
import { useCheckout } from "../stores/checkout";
import {
  cartIdsKeyFromItems,
  invalidateAfterCartMutation,
  readCurrentCart,
} from "./cart-mutations";

export interface CheckoutSuccessParams {
  provider: string;
  sessionId: string;
  orderId?: string | null;
}

export interface GoToCheckoutSuccessParams extends CheckoutSuccessParams {
  navigate: (path: string, options?: { replace?: boolean }) => void;
  replace?: boolean;
}

export function buildCheckoutSuccessUrl({
  provider,
  sessionId,
  orderId,
}: CheckoutSuccessParams): string {
  const params = new URLSearchParams({
    provider,
    session_id: sessionId,
  });
  if (orderId) {
    params.set("order_id", orderId);
  }
  return `/checkout/success?${params.toString()}`;
}

export function prepareCheckoutSuccess(params: CheckoutSuccessParams): string {
  const { provider, sessionId, orderId } = params;
  const store = useCheckout.getState();

  const skipPoll = provider === "local" && Boolean(orderId);

  if (skipPoll && orderId) {
    store.seedSuccess(provider, sessionId, orderId);
  } else {
    store.setPolling(provider, sessionId);
  }

  const url = buildCheckoutSuccessUrl(params);
  return url;
}

export function goToCheckoutSuccess({
  provider,
  sessionId,
  orderId,
  navigate,
  replace,
}: GoToCheckoutSuccessParams): void {
  const path = prepareCheckoutSuccess({ provider, sessionId, orderId });
  navigate(path, replace ? { replace: true } : undefined);
}

export async function invalidateCheckoutSuccessQueries(queryClient: QueryClient): Promise<void> {
  const cart = readCurrentCart(queryClient);
  invalidateAfterCartMutation(queryClient, {
    idsKey: cartIdsKeyFromItems(cart?.items),
    walletChanged: true,
  });

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.my.wins() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.my.instantPrizeWins() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.my.entriesBase() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.my.ordersBase() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.my.profile() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.my.saferPlay() }),
  ]);
}
