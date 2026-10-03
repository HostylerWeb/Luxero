import { Button, Hr, Link, Section, Text } from "@react-email/components";
import type { EmailTemplateProps } from "../types";
import { BaseEmail, emailStyles } from "./base";

export function WelcomeEmail({
  userName,
  code,
  verificationUrl,
  settings,
  frontendUrl,
}: EmailTemplateProps) {
  const supportAddress = settings?.supportAddress ?? "support@luxero.win";
  return (
    <BaseEmail
      preview={`Welcome to Luxero, ${userName}! Start winning luxury prizes today.`}
      settings={settings}
      frontendUrl={frontendUrl}
    >
      <Text className={emailStyles.heading.className}>Welcome to Luxero!</Text>
      <Text className={emailStyles.paragraph.className}>Hi {userName},</Text>
      <Text className={emailStyles.paragraph.className}>
        Thank you for joining Luxero! You&apos;re now part of a community of winners competing for
        incredible luxury prizes.
      </Text>
      <Text className={emailStyles.paragraph.className}>
        Your account is ready. When you&apos;re ready to verify your email, you can use the code
        below — there&apos;s no rush, your account works either way.
      </Text>
      {code && (
        <Section className="my-[32px] text-center">
          <Text className="m-0 mb-[8px] text-[11px] uppercase tracking-widest text-[#A1A1AA]">
            Your Verification Code
          </Text>
          <Text
            className="m-0 mb-[8px] text-[36px] font-semibold tracking-[0.2em] text-[#D4AF37]"
            style={{ fontFamily: "ui-monospace, monospace" }}
          >
            {code}
          </Text>
          <Text className={emailStyles.muted.className}>
            Or{" "}
            <Link href={verificationUrl} className="text-[#D4AF37] no-underline">
              verify via this link
            </Link>
          </Text>
        </Section>
      )}
      <Hr className={emailStyles.divider.className} />
      <Text className={emailStyles.subheading.className}>What&apos;s Next?</Text>
      <Text className={emailStyles.paragraph.className}>
        <span className="font-semibold text-[#D4AF37]">1. Browse Competitions</span>
        <br />
        Explore our active competitions and find prizes you&apos;d love to win.
      </Text>
      <Text className={emailStyles.paragraph.className}>
        <span className="font-semibold text-[#D4AF37]">2. Purchase Tickets</span>
        <br />
        Select the number of tickets you want and answer a simple skill question.
      </Text>
      <Text className={emailStyles.paragraph.className}>
        <span className="font-semibold text-[#D4AF37]">3. Wait for the Draw</span>
        <br />
        Track your entries in your dashboard and watch our live draws.
      </Text>
      <Section className="my-[24px] text-center">
        <Button href={`${frontendUrl}/competitions`} className={emailStyles.button.className}>
          Start Browsing Competitions
        </Button>
      </Section>
      <Hr className={emailStyles.divider.className} />
      <Text className={emailStyles.muted.className}>
        Questions? Contact our support team at{" "}
        <Link href={`mailto:${supportAddress}`} className="text-[#D4AF37] no-underline">
          {supportAddress}
        </Link>
      </Text>
      <Text className={emailStyles.paragraph.className}>
        Good luck!
        <br />
        The Luxero Team
      </Text>
    </BaseEmail>
  );
}

export default WelcomeEmail;
