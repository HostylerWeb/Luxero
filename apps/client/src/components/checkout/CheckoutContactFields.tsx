import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";

export interface CheckoutContactFieldsProps {
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  emailError?: string;
}

export function CheckoutContactFields({
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  emailError,
}: CheckoutContactFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="checkout-email">{t("checkout.contact.emailLabel")}</Label>
        <Input
          id="checkout-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder={t("checkout.contact.emailPlaceholder")}
          required
        />
        {emailError ? <p className="text-sm text-destructive">{emailError}</p> : null}
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="checkout-phone">{t("checkout.contact.phoneLabel")}</Label>
        <Input
          id="checkout-phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder={t("checkout.contact.phonePlaceholder")}
        />
      </div>
    </div>
  );
}
