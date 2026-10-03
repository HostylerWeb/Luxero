"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { dispatchCartUpdated } from "@/lib/cart-events";

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  price: number;
  disabled?: boolean;
}

export function AddToCartButton({ productId, variantId, price, disabled }: AddToCartButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);

  async function handleAddToCart() {
    setAdding(true);
    try {
      const res = await fetch("/api/shop/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, quantity: 1 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to add to cart");
      }
      toast.success("Added to cart");
      dispatchCartUpdated();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }

  const formattedPrice = `\u00A3${(price / 100).toFixed(2)}`;

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled || adding}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold text-black hover:bg-gold/90 shadow-xs font-semibold h-11 px-6 text-sm transition-colors disabled:pointer-events-none disabled:opacity-50"
    >
      {adding ? "Adding..." : `Add to Cart \u2014 ${formattedPrice}`}
    </button>
  );
}
