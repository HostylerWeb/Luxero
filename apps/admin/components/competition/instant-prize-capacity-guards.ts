interface CanSubmitParams {
  isPending: boolean;
  hasAuthoritativeCapacity: boolean;
  hasCapacityError: boolean;
  maxAssignable: number;
  minQuantity: number;
  quantity: number;
  clampedMax: number;
  editing: boolean;
  prizeMode: "template" | "inline";
  selectedPrizeId: string;
  linkedCompetitionId: string;
}

export function isQuantityControlDisabled(params: {
  isPending: boolean;
  capacityLoading: boolean;
  hasCapacityError: boolean;
  hasAuthoritativeCapacity: boolean;
}) {
  return (
    params.isPending ||
    params.capacityLoading ||
    params.hasCapacityError ||
    !params.hasAuthoritativeCapacity
  );
}

export function canSubmitPrizeAssignment(params: CanSubmitParams) {
  return (
    !params.isPending &&
    params.hasAuthoritativeCapacity &&
    !params.hasCapacityError &&
    params.maxAssignable >= params.minQuantity &&
    params.quantity >= params.minQuantity &&
    params.quantity <= params.clampedMax &&
    (params.editing ||
      (params.prizeMode === "inline" ? !!params.linkedCompetitionId : !!params.selectedPrizeId))
  );
}
