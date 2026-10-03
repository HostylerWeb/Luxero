import { translate } from "@/lib/i18n";

export function Head() {
  return (
    <>
      <link rel="stylesheet" href="/paytriot/paytriot-popup.css" />
      <script defer src="/paytriot/paytriot-popup.js" />
      <meta name="description" content={translate("checkout.meta.description")} />
    </>
  );
}
