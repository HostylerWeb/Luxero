"use client";
import { useEffect } from "react";
import { useAuth } from "../auth/use-auth";
import { getReferralRefGateRedirect, parseRefFromSearch } from "../referral/redirect";

interface ReferralRefGateProps {
  pathname?: string;
  router?: {
    replace: (url: string) => void;
  };
  searchParams?: URLSearchParams | null;
}

export function ReferralRefGate(props: ReferralRefGateProps = {}) {
  const { pathname: pathnameProp, router: routerProp, searchParams: searchParamsProp } = props;

  const pathname = pathnameProp ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const router =
    routerProp ??
    (typeof window !== "undefined"
      ? { replace: (url: string) => (window.location.href = url) }
      : { replace: () => {} });
  const searchParams =
    searchParamsProp ??
    (typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null);

  const { user, isAnonymous, isLoading } = useAuth();

  useEffect(() => {
    const ref = searchParams ? parseRefFromSearch(searchParams.toString()) : null;
    const redirectTo = getReferralRefGateRedirect({
      pathname,
      search: searchParams ? searchParams.toString() : "",
      ref,
      user,
      isAnonymous,
      isLoading,
    });

    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAnonymous, pathname, searchParams, router, user]);

  return null;
}
