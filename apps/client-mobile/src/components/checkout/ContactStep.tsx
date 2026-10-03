import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";

interface ContactStepProps {
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onContinue: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export function ContactStep({
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  onContinue,
  onBack,
  showBack = false,
}: ContactStepProps) {
  const { t } = useTranslation();
  const isValid = email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("checkout.contact.emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("checkout.contact.emailPlaceholder")}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="h-9"
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">{t("checkout.contact.phoneLabel")}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder={t("checkout.contact.phonePlaceholder")}
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="h-9"
            autoComplete="tel"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{t("checkout.contact.description")}</p>

      <div className="flex justify-between pt-4">
        {showBack && onBack ? (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-9 px-4 cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            {t("checkout.contact.back")}
          </Button>
        ) : (
          <div />
        )}

        <Button
          type="button"
          onClick={onContinue}
          disabled={!isValid}
          className="h-9 px-4 cursor-pointer flex items-center gap-2"
          data-umami-event="checkout:contact-submit"
        >
          {t("checkout.contact.continue")}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
