export async function buildCheckoutIdempotencyKey(
  cartId: string,
  userId: string,
  cartVersion?: number
): Promise<string> {
  const payload = `${cartId}:${userId}:${cartVersion ?? ""}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
