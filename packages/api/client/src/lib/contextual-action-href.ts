export interface ContextualActionHrefParams {
  focus?: string;
  reason?: string;
  returnTo?: string;
  tab?: string;
}

export interface ContextualErrorActionShape {
  label: string;
  href: string;
  focus?: string;
  reason?: string;
}

const SAFE_RETURN_TO = /^\/(?!\/)[\w\-./?=&%]*$/;

export function isSafeReturnToPath(path: string | null | undefined): path is string {
  if (!path?.startsWith("/") || path.startsWith("//")) return false;
  return SAFE_RETURN_TO.test(path);
}

export function buildContextualActionHref(
  base: string,
  params?: ContextualActionHrefParams
): string {
  if (!params) return base;

  const hashIndex = base.indexOf("#");
  const withoutHash = hashIndex >= 0 ? base.slice(0, hashIndex) : base;
  const hash = hashIndex >= 0 ? base.slice(hashIndex) : "";

  const [path, existingQuery] = withoutHash.split("?");
  const sp = new URLSearchParams(existingQuery ?? "");

  if (params.tab) sp.set("tab", params.tab);
  if (params.focus) sp.set("focus", params.focus);
  if (params.reason) sp.set("reason", params.reason);
  if (params.returnTo && isSafeReturnToPath(params.returnTo)) {
    sp.set("returnTo", params.returnTo);
  }

  const qs = sp.toString();
  return qs ? `${path}?${qs}${hash}` : `${path}${hash}`;
}

export function contextualErrorAction(
  label: string,
  base: string,
  params?: ContextualActionHrefParams
): ContextualErrorActionShape {
  return {
    label,
    href: buildContextualActionHref(base, params),
    focus: params?.focus,
    reason: params?.reason,
  };
}

export function withCheckoutReturnTo(error: {
  message: string;
  code?: string;
  action?: ContextualErrorActionShape;
}): { message: string; code?: string; action?: ContextualErrorActionShape } {
  if (!error.action) return error;
  return {
    ...error,
    action: {
      ...error.action,
      href: buildContextualActionHref(error.action.href, { returnTo: "/checkout" }),
    },
  };
}
