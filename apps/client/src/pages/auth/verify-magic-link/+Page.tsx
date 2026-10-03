import { useEffect, useRef } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useTranslation } from "@/lib/i18n";

export default function Page() {
  const { t } = useTranslation();
  const ctx = usePageContext();
  const formRef = useRef<HTMLFormElement>(null);

  const token = ctx.urlParsed.search.token || "";
  const callbackURL = ctx.urlParsed.search.callbackURL || "/dashboard";
  const errorCallbackURL = "/auth/error";

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form ref={formRef} method="POST" action="/api/auth/magic-link/verify">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="callbackURL" value={callbackURL} />
        <input type="hidden" name="errorCallbackURL" value={errorCallbackURL} />
      </form>
      <p className="text-muted-foreground">{t("auth.magicLink.verifying")}</p>
    </div>
  );
}
