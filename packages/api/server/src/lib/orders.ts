import { Order, Profile } from "@luxero/api-db/models";
import { sendEmail } from "@luxero/api-email/client";
import { getEmailConfig } from "@luxero/api-email/config";
import { InstantWinEmail } from "@luxero/api-email/templates/instant-win";
import { OrderConfirmationEmail } from "@luxero/api-email/templates/order-confirmation";
import { getCurrentContext } from "@luxero/api-infra/env";
import { formatOrderNumber } from "@luxero/utils";
import { render } from "@react-email/render";

export interface OrderEmailItem {
  competitionTitle: string;
  quantity: number;
  unitPrice: number;
  ticketNumbers: number[];
  totalPrice: number;
}

interface SendOrderConfirmationParams {
  userId: string;
  orderId: string;
  orderNumber?: number;
  orderDate: string;
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  total: number;
  isGuest?: boolean;
  orderEmail?: string;
}

function safeMoney(n: unknown): number {
  const v = Number(n);
  return Number.isFinite(v) ? Math.max(0, v) : 0;
}

export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationParams
): Promise<void> {
  const profile = await Profile.findById(params.userId).lean();
  const recipientEmail =
    params.orderEmail ??
    (profile?.email && !profile.email.endsWith("@guest.luxero.local") ? profile.email : undefined);

  if (!recipientEmail) {
    await Order.findByIdAndUpdate(params.orderId, {
      $set: {
        "metadata.confirmationEmailSentAt": new Date(),
        "metadata.confirmationEmailSkippedReason": "no_recipient",
      },
    });
    return;
  }

  const userName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`
    : recipientEmail.split("@")[0] || "Customer";

  const safeItems: OrderEmailItem[] = (params.items ?? []).map((item) => ({
    competitionTitle: item.competitionTitle ?? "",
    quantity: safeMoney(item.quantity),
    unitPrice: safeMoney(item.unitPrice),
    ticketNumbers: Array.isArray(item.ticketNumbers)
      ? item.ticketNumbers.map((t) => safeMoney(t))
      : [],
    totalPrice: safeMoney(item.totalPrice),
  }));

  const emailPayload = {
    items: safeItems,
    subtotal: safeMoney(params.subtotal),
    discount: safeMoney(params.discount),
    total: safeMoney(params.total),
    orderNumber: params.orderNumber,
    orderDate: params.orderDate,
    orderEmail: params.orderEmail,
    isGuest: params.isGuest,
  };

  await Order.findByIdAndUpdate(params.orderId, {
    $set: { "metadata.confirmationEmailPayload": emailPayload },
    $inc: { "metadata.confirmationEmailAttempts": 1 },
  });

  try {
    const settings = await getEmailConfig();
    const { frontendUrl } = getCurrentContext();
    const emailHtml = await render(
      OrderConfirmationEmail({
        userName,
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        orderDate: params.orderDate,
        items: safeItems,
        subtotal: safeMoney(params.subtotal),
        discount: safeMoney(params.discount),
        total: safeMoney(params.total),
        settings,
        frontendUrl,
        isGuest: params.isGuest,
      })
    );
    const sendResult = await sendEmail({
      to: recipientEmail,
      subject: `Order confirmed — Luxero (${params.orderNumber != null ? formatOrderNumber(params.orderNumber) : params.orderId})`,
      html: emailHtml,
    });
    if (!sendResult.success) {
      throw new Error(sendResult.error ?? "Failed to send order confirmation email");
    }

    await Order.findByIdAndUpdate(params.orderId, {
      $set: { "metadata.confirmationEmailSentAt": new Date() },
      $unset: {
        "metadata.confirmationEmailLastError": 1,
      },
    });
  } catch (emailErr) {
    const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
    await Order.findByIdAndUpdate(params.orderId, {
      $set: { "metadata.confirmationEmailLastError": message },
    });
    console.error("Failed to send order confirmation email:", emailErr);
    throw emailErr;
  }
}

export interface InstantWinEmailItem {
  prizeTitle: string;
  prizeImage?: string;
  prizeValue?: number;
  ticketNumber: number;
  competitionName?: string;
}

interface SendInstantWinEmailParams {
  userId: string;
  wins: InstantWinEmailItem[];
  isGuest?: boolean;
}

export async function sendInstantWinEmail(params: SendInstantWinEmailParams): Promise<void> {
  const profile = await Profile.findById(params.userId).lean();
  const recipientEmail =
    profile?.email && !profile.email.endsWith("@guest.luxero.local") ? profile.email : undefined;

  if (!recipientEmail) return;

  const userName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`
    : recipientEmail.split("@")[0] || "Customer";

  try {
    const settings = await getEmailConfig();
    const { frontendUrl } = getCurrentContext();
    const emailHtml = await render(
      InstantWinEmail({
        userName,
        wins: params.wins,
        settings,
        frontendUrl,
        isGuest: params.isGuest,
      })
    );
    const subject =
      params.wins.length === 1
        ? `You won ${params.wins[0]!.prizeTitle}! — Instant Prize from Luxero`
        : `You won ${params.wins.length} instant prizes! — Luxero`;
    await sendEmail({
      to: recipientEmail,
      subject,
      html: emailHtml,
    });
  } catch (emailErr) {
    console.error("Failed to send instant win email:", emailErr);
  }
}
