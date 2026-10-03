import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { fetchProductBySlug } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const shopUrl =
    process.env.NEXT_PUBLIC_SHOP_URL || process.env.APP_URL || "https://shop.luxero.win";

  try {
    const res = await fetchProductBySlug(slug);
    const product = res.data;

    const imageUrl = product.images?.[0] || "/og-default.png";
    const imageSecureUrl = imageUrl.startsWith("http")
      ? imageUrl
      : `${shopUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;

    return {
      title: `${product.name} — Luxero Shop`,
      description: product.description?.substring(0, 160),
      openGraph: {
        title: product.name,
        description: product.description?.substring(0, 160),
        url: `${shopUrl}/products/${slug}`,
        images: [
          {
            url: imageUrl,
            secureUrl: imageSecureUrl,
            type: "image/png",
            width: 1200,
            height: 630,
          },
        ],
        siteName: "Luxero Shop",
        type: "website",
      },
    };
  } catch {
    return { title: "Product Not Found — Luxero Shop" };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product: any;
  try {
    const res = await fetchProductBySlug(slug);
    product = res.data;
  } catch {
    notFound();
  }

  return <ProductDetail slug={slug} product={product} />;
}
