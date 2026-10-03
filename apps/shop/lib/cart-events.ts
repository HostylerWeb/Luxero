export const CART_UPDATED_EVENT = "cart:updated";

export function dispatchCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
  }
}

export function onCartUpdated(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CART_UPDATED_EVENT, callback);
  return () => window.removeEventListener(CART_UPDATED_EVENT, callback);
}
