import { Profile } from "@luxero/api-db/models";
import { sendEmail } from "@luxero/api-email/client";
import { getEmailConfig } from "@luxero/api-email/config";
import { AdminEmergencyEmail } from "@luxero/api-email/templates/admin-emergency";
import { EmailVerificationEmail } from "@luxero/api-email/templates/email-verification";
import { MagicLinkSignInEmail } from "@luxero/api-email/templates/magic-link-sign-in";
import { PasswordResetEmail } from "@luxero/api-email/templates/password-reset";
import { getCurrentContext } from "@luxero/api-infra/env";
import { render } from "@react-email/render";

async function resolveUserName(email: string): Promise<string> {
  try {
    const profile = await Profile.findOne({ email }).lean();
    if (profile?.firstName) {
      return `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`;
    }
  } catch {
    // Profile lookup failed — fall through to email fallback
  }
  return email.split("@")[0] || "there";
}

function logEmailFailure(kind: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[EMAIL] Failed to send ${kind}: ${message}`);
}

export async function sendOtpEmail({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
  userName?: string;
}): Promise<void> {
  try {
    const { frontendUrl } = getCurrentContext();
    const settings = await getEmailConfig();
    const displayName = await resolveUserName(email);

    if (type === "forget-password") {
      const resetUrl = `${frontendUrl}/auth/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(otp)}`;
      const html = await render(
        PasswordResetEmail({
          userName: displayName,
          code: otp,
          resetUrl,
          settings,
          frontendUrl,
        })
      );
      await sendEmail({
        to: email,
        subject: "Reset your Luxero password",
        html,
        text: `Hi ${displayName}, your password reset code is ${otp}. It expires in 5 minutes. Or visit: ${resetUrl}`,
      });
      return;
    }

    const verificationUrl = `${frontendUrl}/auth/verify?email=${encodeURIComponent(email)}&code=${encodeURIComponent(otp)}`;
    const html = await render(
      EmailVerificationEmail({
        userName: displayName,
        code: otp,
        verificationUrl,
        purpose: type,
        settings,
        frontendUrl,
      })
    );

    const subject = type === "sign-in" ? "Your Luxero sign-in code" : "Verify your Luxero email";

    await sendEmail({
      to: email,
      subject,
      html,
      text: `Hi ${displayName}, your ${type === "sign-in" ? "sign-in" : "verification"} code is ${otp}. It expires in 15 minutes. Or visit: ${verificationUrl}`,
    });
  } catch (error) {
    logEmailFailure(`${type} OTP email`, error);
  }
}

export async function sendMagicLinkEmail({
  email,
  url,
}: {
  email: string;
  url: string;
  token: string;
}): Promise<void> {
  try {
    const { frontendUrl } = getCurrentContext();
    const settings = await getEmailConfig();
    const userName = await resolveUserName(email);

    const html = await render(
      MagicLinkSignInEmail({
        userName,
        signInUrl: url,
        settings,
        frontendUrl,
      })
    );

    await sendEmail({
      to: email,
      subject: "Sign in to Luxero",
      html,
      text: `Hi ${userName}, sign in to Luxero: ${url}`,
    });
  } catch (error) {
    logEmailFailure("magic link email", error);
  }
}

export async function sendEmergencyOtpEmail({
  email,
  otp,
  recoveryUrl,
}: {
  email: string;
  otp: string;
  recoveryUrl: string;
}): Promise<void> {
  try {
    const { frontendUrl } = getCurrentContext();
    const settings = await getEmailConfig();
    const displayName = await resolveUserName(email);

    const html = await render(
      AdminEmergencyEmail({
        userName: displayName,
        code: otp,
        recoveryUrl,
        settings,
        frontendUrl,
      })
    );

    await sendEmail({
      to: email,
      subject: "Luxero admin emergency recovery code",
      html,
      text: `Hi ${displayName}, your admin emergency recovery code is ${otp}. It expires in 5 minutes. Open: ${recoveryUrl}`,
    });
  } catch (error) {
    logEmailFailure("admin emergency OTP email", error);
    throw error;
  }
}
