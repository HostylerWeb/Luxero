import { AsyncLocalStorage } from "node:async_hooks";

export interface AffiliateContext {
  clickId: string | null;
  source: string | null;
}

const affiliateStorage = new AsyncLocalStorage<AffiliateContext>();

export function getAffiliateContext(): AffiliateContext {
  return (
    affiliateStorage.getStore() ?? {
      clickId: null,
      source: null,
    }
  );
}

export function getAffiliateClickId(): string | null {
  return getAffiliateContext().clickId;
}

export function getAffiliateSource(): string | null {
  return getAffiliateContext().source;
}

export function runWithAffiliateContext<T>(ctx: AffiliateContext, fn: () => T): T {
  return affiliateStorage.run(ctx, fn);
}
