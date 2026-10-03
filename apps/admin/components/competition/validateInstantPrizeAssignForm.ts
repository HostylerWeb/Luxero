import type { InstantPrizeCapacityResponse } from "@luxero/types";

export interface InstantPrizeAssignFormValues {
  quantity: number;
  selectedPrizeId: string;
  createInline: boolean;
  linkedCompetitionId: string;
  ticketCount: number;
}

export interface InstantPrizeAssignFormErrors {
  quantity?: string;
  prize?: string;
  linkedCompetitionId?: string;
  ticketCount?: string;
}

export function validateInstantPrizeAssignForm(
  values: InstantPrizeAssignFormValues,
  options: {
    editing: boolean;
    claimedCount: number;
    capacity?: InstantPrizeCapacityResponse | null;
    minQuantity?: number;
  }
): InstantPrizeAssignFormErrors {
  const errors: InstantPrizeAssignFormErrors = {};
  const { quantity, selectedPrizeId, createInline, linkedCompetitionId, ticketCount } = values;
  const minQty = options.minQuantity ?? (options.editing ? options.claimedCount : 1);

  if (!Number.isInteger(quantity) || quantity < minQty) {
    errors.quantity =
      options.editing && options.claimedCount > 0
        ? `Quantity must be at least ${options.claimedCount} (${options.claimedCount} already claimed)`
        : "Quantity must be at least 1";
  }

  const capacity = options.capacity;
  if (capacity && quantity > capacity.maxAssignableQty) {
    errors.quantity = `You can add at most ${capacity.maxAssignableQty} slot${capacity.maxAssignableQty === 1 ? "" : "s"} right now`;
  }

  if (!options.editing) {
    if (!createInline && !selectedPrizeId) {
      errors.prize = "Choose a prize template or create a ticket prize";
    }
    if (createInline && !linkedCompetitionId) {
      errors.linkedCompetitionId = "Select a linked competition";
    }
    if (createInline && (!Number.isInteger(ticketCount) || ticketCount < 1)) {
      errors.ticketCount = "Tickets per win must be at least 1";
    }
  }

  if (capacity?.linkedCompetition && quantity > 0) {
    const ticketsRequired = quantity * capacity.linkedCompetition.ticketsPerSlot;
    if (ticketsRequired > capacity.linkedCompetition.availableTickets) {
      errors.quantity = `Requires ${ticketsRequired} tickets in "${capacity.linkedCompetition.title}" but only ${capacity.linkedCompetition.availableTickets} available`;
    }
  }

  return errors;
}

export function hasAssignFormErrors(errors: InstantPrizeAssignFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
