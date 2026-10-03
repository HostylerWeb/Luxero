import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";

interface ShippingStepProps {
  address1: string;
  address2: string;
  city: string;
  postcode: string;
  onAddress1Change: (value: string) => void;
  onAddress2Change: (value: string) => void;
  onCityChange: (value: string) => void;
  onPostcodeChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function ShippingStep({
  address1,
  address2,
  city,
  postcode,
  onAddress1Change,
  onAddress2Change,
  onCityChange,
  onPostcodeChange,
  onContinue,
  onBack,
}: ShippingStepProps) {
  const { t: _t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = _t as any;
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">{t("checkout.shippingAddress.description")}</p>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="address1">{t("checkout.shippingAddress.addressLine1")}</Label>
          <Input
            id="address1"
            placeholder={t("checkout.shippingAddress.address1Placeholder")}
            value={address1}
            onChange={(e) => onAddress1Change(e.target.value)}
            className="h-9"
            autoComplete="address-line1"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="address2">{t("checkout.shippingAddress.addressLine2")}</Label>
          <Input
            id="address2"
            placeholder={t("checkout.shippingAddress.address2Placeholder")}
            value={address2}
            onChange={(e) => onAddress2Change(e.target.value)}
            className="h-9"
            autoComplete="address-line2"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">{t("checkout.shippingAddress.city")}</Label>
            <Input
              id="city"
              placeholder={t("checkout.shippingAddress.cityPlaceholder")}
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className="h-9"
              autoComplete="address-level2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="postcode">{t("checkout.shippingAddress.postcode")}</Label>
            <Input
              id="postcode"
              placeholder={t("checkout.shippingAddress.postcodePlaceholder")}
              value={postcode}
              onChange={(e) => onPostcodeChange(e.target.value)}
              className="h-9"
              autoComplete="postal-code"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-9 px-4 cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="size-4" />
          {t("checkout.shippingAddress.back")}
        </Button>

        <Button
          type="button"
          onClick={onContinue}
          className="h-9 px-4 cursor-pointer flex items-center gap-2"
          data-umami-event="checkout:shipping-submit"
        >
          {t("checkout.shippingAddress.continueToPayment")}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
