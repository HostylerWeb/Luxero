import { Button, Hr, Link, Section, Text } from "@react-email/components";
import type { EmailTemplateProps } from "../types";
import { BaseEmail, emailStyles } from "./base";

function formatMoney(amount: number, currency: string): string {
  if (currency === "GBP") {
    return `£${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} ${currency}`;
}

export function SiteCreditCreditedEmail({
  userName,
  creditAmount = 0,
  balanceAfter = 0,
  currency = "GBP",
  walletUrl,
  settings,
  frontendUrl,
}: EmailTemplateProps) {
  const supportAddress = settings?.supportAddress ?? "support@luxero.win";
  const credited = formatMoney(creditAmount, currency);
  const balance = formatMoney(balanceAfter, currency);

  return (
    <BaseEmail
      preview={`${credited} site credit has been added to your Luxero wallet`}
      settings={settings}
      frontendUrl={frontendUrl}
    >
      <Text className="mb-[8px] text-center text-[14px] font-semibold tracking-widest uppercase text-[#D4AF37]">
        Site Credit
      </Text>
      <Text className={emailStyles.heading.className}>Credit added to your wallet</Text>
      <Text className={emailStyles.paragraph.className}>Hi {userName},</Text>
      <Text className={emailStyles.paragraph.className}>
        We&apos;ve added site credit to your Luxero wallet. You can use it toward competition
        entries at checkout.
      </Text>
      <Section
        className="my-[24px] rounded-[12px] border-2 border-[#D4AF37] bg-[#0A0A0B] p-[24px] text-center"
        style={{ borderWidth: "2px", borderStyle: "solid" }}
      >
        <Text className="m-0 mb-[8px] text-[11px] uppercase tracking-widest text-[#A1A1AA]">
          Amount added
        </Text>
        <Text className="m-0 mb-[16px] text-[28px] font-semibold text-[#D4AF37]">{credited}</Text>
        <Text className="m-0 text-[13px] text-[#A1A1AA]">
          New wallet balance:{" "}
          <span className="font-semibold text-[#FFFFFF]">{balance}</span>
        </Text>
      </Section>
      {walletUrl ? (
        <Section className="my-[32px] text-center">
          <Button
            href={walletUrl}
            className="bg-[#D4AF37] rounded-[6px] px-[32px] py-[16px] text-[17px] font-semibold text-[#0A0A0B] no-underline inline-block text-center"
          >
            View your wallet
          </Button>
        </Section>
      ) : null}
      <Hr className={emailStyles.divider.className} />
      <Text className={emailStyles.muted.className}>
        Questions? Contact us at{" "}
        <Link href={`mailto:${supportAddress}`} className="text-[#D4AF37] no-underline">
          {supportAddress}
        </Link>
      </Text>
      <Text className={emailStyles.paragraph.className}>
        Good luck,
        <br />
        The Luxero Team
      </Text>
    </BaseEmail>
  );
}

export default SiteCreditCreditedEmail;
