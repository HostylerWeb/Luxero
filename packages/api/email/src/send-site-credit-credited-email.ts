import { sendEmail } from "./client";
import { getEmailConfig } from "./config";
import { SiteCreditCreditedEmail } from "./templates/site-credit-credited";
import { render } from "@react-email/render";

const GUEST_EMAIL_SUFFIX = "@guest.luxero.local";

export type SendSiteCreditCreditedEmailParams = {
  recipientEmail: string;
  userName: string;
  creditAmount: number;
  balanceAfter: number;
  currency?: string;
  frontendUrl: string;
};

export async function sendSiteCreditCreditedEmail(
  params: SendSiteCreditCreditedEmailParams
): Promise<void> {
  const email = params.recipientEmail.trim();
  if (!email || email.endsWith(GUEST_EMAIL_SUFFIX)) {
    return;
  }

  if (params.creditAmount <= 0) {
    return;
  }

  try {
    const settings = await getEmailConfig();
    const walletUrl = `${params.frontendUrl}/dashboard/wallet`;
    const currency = params.currency ?? "GBP";

    const emailHtml = await render(
      SiteCreditCreditedEmail({
        userName: params.userName,
        creditAmount: params.creditAmount,
        balanceAfter: params.balanceAfter,
        currency,
        walletUrl,
        settings,
        frontendUrl: params.frontendUrl,
      })
    );

    const subject =
      currency === "GBP"
        ? `£${params.creditAmount.toFixed(2)} site credit added to your wallet — Luxero`
        : `${params.creditAmount.toFixed(2)} ${currency} site credit added — Luxero`;

    await sendEmail({
      to: email,
      subject,
      html: emailHtml,
    });
  } catch (emailErr) {
    console.error("[email] Failed to send site credit credited email:", emailErr);
  }
}
