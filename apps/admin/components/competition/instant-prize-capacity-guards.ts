export type InstantPrizeSetupMode =
  | "cash"
  | "site_credit"
  | "physical"
  | "free_tickets"
  | "saved";

export function isProductPrizeSetup(setup: InstantPrizeSetupMode): boolean {
  return setup === "cash" || setup === "site_credit" || setup === "physical";
}

interface CanSubmitParams {
  isPending: boolean;
  hasAuthoritativeCapacity: boolean;
  hasCapacityError: boolean;
  maxAssignable: number;
  minQuantity: number;
  quantity: number;
  clampedMax: number;
  editing: boolean;
  setup: InstantPrizeSetupMode;
  selectedPrizeId: string;
  linkedCompetitionId: string;
  prizeName: string;
}

export function isQuantityControlDisabled(params: { isPending: boolean }) {
  return params.isPending;
}

export function canSubmitPrizeAssignment(params: CanSubmitParams) {
  const prizeReady =
    params.editing ||
    (params.setup === "saved"
      ? !!params.selectedPrizeId
      : params.setup === "free_tickets"
        ? !!params.linkedCompetitionId
        : isProductPrizeSetup(params.setup)
          ? params.prizeName.trim().length > 0
          : false);

  return (
    !params.isPending &&
    (params.editing || params.hasAuthoritativeCapacity) &&
    (params.editing || !params.hasCapacityError) &&
    (params.editing ||
      (params.maxAssignable >= params.minQuantity &&
        params.quantity >= params.minQuantity &&
        params.quantity <= params.clampedMax)) &&
    prizeReady
  );
}
