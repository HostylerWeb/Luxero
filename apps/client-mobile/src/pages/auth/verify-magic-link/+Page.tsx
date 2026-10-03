import { useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n";

export default function Page() {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const token = searchParams.get("token") || "";
  const callbackURL = searchParams.get("callbackURL") || "/dashboard";
  const errorCallbackURL = "/auth/error";

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <div className="h-full overflow-y-auto flex flex-col justify-center px-4">
      <form ref={formRef} method="POST" action="/api/auth/magic-link/verify">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="callbackURL" value={callbackURL} />
        <input type="hidden" name="errorCallbackURL" value={errorCallbackURL} />
      </form>
      <p className="text-muted-foreground">{t("auth.magicLink.verifying")}</p>
    </div>
  );
}
