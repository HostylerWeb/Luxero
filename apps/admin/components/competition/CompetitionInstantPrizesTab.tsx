"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ApiResponseError,
  api,
  useAdminCompetitionInstantPrizeAssignmentMutations,
  useAdminCompetitionInstantPrizeAssignments,
  useAdminCompetitions,
  useAdminInstantPrizeCapacity,
  useAdminInstantPrizeTemplateMutations,
  useAdminInstantPrizeTemplates,
} from "@luxero/api-admin";
import { GripVertical, Loader2, Plus, Trophy } from "@luxero/icons";
import type { AdminCompetition, AdminInstantPrize, CompetitionInstantPrize } from "@luxero/types";
import { getAvailableTickets } from "@luxero/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminConfirmDialog, EmptyState, EntityActionMenu } from "@/components/admin";
import { AsyncCombobox } from "@/components/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-admin-table-url";
import { cn } from "@/lib/utils";
import { InstantPrizeCapacityPanel } from "./InstantPrizeCapacityPanel";
import {
  canSubmitPrizeAssignment,
  isQuantityControlDisabled,
} from "./instant-prize-capacity-guards";
import {
  hasAssignFormErrors,
  validateInstantPrizeAssignForm,
} from "./validateInstantPrizeAssignForm";

function activeCipQuantity(cipList: CompetitionInstantPrize[]): number {
  return cipList.filter((cip) => !cip.isArchived).reduce((acc, cip) => acc + cip.quantity, 0);
}

function AvailabilityBadge({ competitionId }: { competitionId: string }) {
  const { data } = useAdminCompetitions({ statusFilter: "" });
  const comp = (data?.data ?? []).find((c: AdminCompetition) => c._id === competitionId);
  if (!comp) return null;

  const available = getAvailableTickets(comp);
  const pct = comp.maxTickets ? Math.round((available / comp.maxTickets) * 100) : 0;

  return (
    <FieldDescription>
      {available} / {comp.maxTickets} tickets available in pool
      {pct < 20 && available > 0 && <span className="text-destructive"> — running low</span>}
      {available === 0 && <span className="text-destructive"> — none left</span>}
    </FieldDescription>
  );
}

interface CompetitionInstantPrizesTabProps {
  competitionId: string;
  maxTickets: number;
  onAddPrize?: () => void;
  onEditPrize?: (cip: CompetitionInstantPrize) => void;
}

function PrizeEntryRow({
  cip,
  onEdit,
  onDelete,
}: {
  cip: CompetitionInstantPrize;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cip.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const numbers = cip.winningEntryNumbers ?? [];
  const visibleNumbers = numbers.slice(0, 3);
  const remainingCount = numbers.length - 3;
  const isCompetitionTicket = cip.instantPrize?.type === "competition_ticket";
  const ticketCount = cip.instantPrize?.ticketCount ?? 1;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn("overflow-hidden py-0 transition-all", isDragging && "opacity-40")}
    >
      <CardContent className="flex items-start gap-2 p-4">
        <button
          type="button"
          className="mt-0.5 flex cursor-grab touch-none items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
          tabIndex={-1}
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">
                {cip.instantPrize?.title ?? "Unknown Prize"}
              </span>
              {isCompetitionTicket && (
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  Ticket ×{ticketCount}
                </Badge>
              )}
              {cip.isArchived && (
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  Archived
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>Qty: {cip.quantity}</span>
              {isCompetitionTicket ? (
                <span>
                  {numbers.length === 0
                    ? "No winning entries yet"
                    : `${numbers.length} winning ${numbers.length === 1 ? "entry" : "entries"} × ${ticketCount} tickets each`}
                </span>
              ) : (
                <span>
                  Winning numbers:{" "}
                  {numbers.length === 0 ? (
                    "None generated yet"
                  ) : (
                    <>
                      {visibleNumbers.join(", ")}
                      {remainingCount > 0 && (
                        <span className="text-primary"> ...+{remainingCount} more</span>
                      )}
                    </>
                  )}
                </span>
              )}
              <span className="text-foreground">
                {cip.claimedCount} / {cip.quantity} claimed
              </span>
            </div>
          </div>
          {!cip.isArchived && (
            <EntityActionMenu
              triggerLabel="Instant prize actions"
              className="shrink-0"
              onEdit={onEdit}
              editLabel="Edit quantity"
              onDelete={onDelete}
              deleteLabel="Remove"
              deleteTitle="Remove Instant Prize"
              deleteDescription="Remove this instant prize assignment from the competition?"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type PrizeMode = "template" | "inline";

export function AddPrizeDrawer({
  competitionId,
  open,
  onOpenChange,
  editingCip,
}: {
  competitionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCip?: CompetitionInstantPrize | null;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [prizeMode, setPrizeMode] = useState<PrizeMode>("template");
  const [selectedPrizeId, setSelectedPrizeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const debouncedQuantity = useDebouncedValue(quantity);
  const [linkedCompetitionId, setLinkedCompetitionId] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [capacityNotice, setCapacityNotice] = useState<string | null>(null);

  const { data: templatesResponse } = useAdminInstantPrizeTemplates({ limit: 100 });
  const templates = (templatesResponse?.data ?? []) as AdminInstantPrize[];
  const { data: competitionsResponse } = useAdminCompetitions({ limit: 100 });
  const allCompetitions = (competitionsResponse?.data ?? []) as AdminCompetition[];
  const selectedComp = allCompetitions.find((c) => c._id === linkedCompetitionId);
  const linkedCompTitle = selectedComp?.title ?? linkedCompetitionId;
  const activeTemplates = templates.filter((t) => {
    if (!t.isActive) return false;
    if (t.type === "competition_ticket" && !t.linkedCompetitionId) return false;
    if (
      t.type === "competition_ticket" &&
      t.linkedCompetition?.status &&
      t.linkedCompetition.status !== "active"
    )
      return false;
    return true;
  });

  const selectedTemplate = templates.find((t) => t._id === selectedPrizeId);
  const isCompetitionTicketTemplate =
    prizeMode === "inline" ||
    selectedTemplate?.type === "competition_ticket" ||
    editingCip?.instantPrize?.type === "competition_ticket";

  const effectiveLinkedId =
    linkedCompetitionId ||
    selectedTemplate?.linkedCompetitionId ||
    editingCip?.instantPrize?.linkedCompetitionId;
  const effectiveTicketCount =
    prizeMode === "inline" || isCompetitionTicketTemplate
      ? ticketCount || editingCip?.instantPrize?.ticketCount || 1
      : 1;

  const capacityParams = useMemo(
    () => ({
      instantPrizeId: editingCip ? undefined : selectedPrizeId || undefined,
      quantity: debouncedQuantity,
      linkedCompetitionId: isCompetitionTicketTemplate ? effectiveLinkedId : undefined,
      ticketCount: isCompetitionTicketTemplate ? effectiveTicketCount : undefined,
      excludeCipId: editingCip?.id,
    }),
    [
      editingCip,
      selectedPrizeId,
      debouncedQuantity,
      isCompetitionTicketTemplate,
      effectiveLinkedId,
      effectiveTicketCount,
    ]
  );

  const {
    data: capacityResponse,
    isLoading: capacityLoading,
    isError: hasCapacityError,
    error: capacityError,
  } = useAdminInstantPrizeCapacity(competitionId, capacityParams, {
    enabled: open && !!competitionId && (step === 2 || !!editingCip),
  });
  const capacity = capacityResponse?.data ?? null;
  const hasAuthoritativeCapacity = !!capacity && !capacityLoading && !hasCapacityError;
  const maxAssignable = capacity?.maxAssignableQty ?? 0;

  const { createMutation, updateMutation } = useAdminCompetitionInstantPrizeAssignmentMutations();
  const { createMutation: createTemplateMutation } = useAdminInstantPrizeTemplateMutations();
  const isPending =
    createMutation.isPending || updateMutation.isPending || createTemplateMutation.isPending;

  const minQuantity = editingCip ? editingCip.claimedCount : 1;
  const clampedMax = editingCip
    ? Math.max(minQuantity, maxAssignable, editingCip.quantity)
    : Math.max(minQuantity, maxAssignable);

  const resetForm = useCallback(() => {
    setStep(1);
    setPrizeMode("template");
    setSelectedPrizeId("");
    setQuantity(1);
    setLinkedCompetitionId("");
    setTicketCount(1);
    setFieldErrors({});
    setCapacityNotice(null);
  }, []);

  useEffect(() => {
    if (open) {
      if (editingCip) {
        setStep(2);
        setQuantity(editingCip.quantity);
        if (editingCip.instantPrize?.type === "competition_ticket") {
          setLinkedCompetitionId(editingCip.instantPrize.linkedCompetitionId ?? "");
          setTicketCount(editingCip.instantPrize.ticketCount ?? 1);
        }
      } else {
        resetForm();
      }
      setFieldErrors({});
      setCapacityNotice(null);
    }
  }, [open, editingCip, resetForm]);

  useEffect(() => {
    if (!hasAuthoritativeCapacity) return;
    if (debouncedQuantity > clampedMax) {
      setQuantity(clampedMax > 0 ? clampedMax : minQuantity);
      setCapacityNotice(
        capacity?.quantityMessage ??
          `Quantity was reduced to ${clampedMax > 0 ? clampedMax : minQuantity} to match current capacity.`
      );
    } else if (capacityNotice && debouncedQuantity <= clampedMax) {
      setCapacityNotice(null);
    }
  }, [
    hasAuthoritativeCapacity,
    debouncedQuantity,
    clampedMax,
    minQuantity,
    capacity,
    capacityNotice,
  ]);

  function handleClose() {
    resetForm();
    onOpenChange(false);
  }

  function selectTemplate(template: AdminInstantPrize) {
    if (template.type === "competition_ticket" && !template.linkedCompetitionId) {
      setFieldErrors({
        prize:
          "This template has no linked competition. Fix it on the Instant Prizes admin page first.",
      });
      return;
    }
    setFieldErrors({});
    setSelectedPrizeId(template._id);
    if (template.type === "competition_ticket") {
      setLinkedCompetitionId(template.linkedCompetitionId ?? "");
      setTicketCount(template.ticketCount ?? 1);
    }
  }

  function goToStep2() {
    if (!editingCip) {
      if (prizeMode === "template" && !selectedPrizeId) {
        setFieldErrors({ prize: "Choose a prize template to continue" });
        return;
      }
      if (prizeMode === "inline" && !linkedCompetitionId) {
        setFieldErrors({ linkedCompetitionId: "Select a linked competition" });
        return;
      }
    }
    setFieldErrors({});
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasAuthoritativeCapacity) {
      setFieldErrors({
        form: capacityLoading
          ? "Capacity is still loading. Please wait before saving."
          : "Capacity could not be verified. Reload the drawer and try again.",
      });
      return;
    }
    const errors = validateInstantPrizeAssignForm(
      {
        quantity,
        selectedPrizeId,
        createInline: prizeMode === "inline",
        linkedCompetitionId,
        ticketCount,
      },
      {
        editing: !!editingCip,
        claimedCount: editingCip?.claimedCount ?? 0,
        capacity,
        minQuantity,
      }
    );

    if (hasAssignFormErrors(errors)) {
      setFieldErrors(errors as Record<string, string>);
      return;
    }
    setFieldErrors({});

    try {
      let prizeId = selectedPrizeId;

      if (editingCip) {
        const prevQty = editingCip.quantity;
        if (quantity < prevQty) {
          await updateMutation.mutateAsync({
            id: editingCip.id,
            payload: { quantity, absolute: true },
          });
          toast.success(`Quantity reduced to ${quantity}`);
        } else if (quantity > prevQty) {
          await updateMutation.mutateAsync({
            id: editingCip.id,
            payload: { quantity: quantity - prevQty },
          });
          toast.success(
            `Added ${quantity - prevQty} more slot${quantity - prevQty !== 1 ? "s" : ""}`
          );
        } else if (isCompetitionTicketTemplate) {
          await updateMutation.mutateAsync({
            id: editingCip.id,
            payload: {
              linkedCompetitionId: linkedCompetitionId || undefined,
              ticketCount,
            },
          });
          toast.success("Ticket prize settings updated");
        } else {
          toast.info("No changes to save");
          handleClose();
          return;
        }
      } else {
        if (prizeMode === "inline") {
          const ticketLabel = ticketCount === 1 ? "Ticket" : "Tickets";
          const result = await createTemplateMutation.mutateAsync({
            title: `Free ${ticketCount} ${ticketLabel} to ${linkedCompTitle}`,
            value: 0,
            images: [],
            isActive: true,
            type: "competition_ticket",
            linkedCompetitionId,
            ticketCount,
          });
          prizeId = (result as unknown as { data: { _id: string } }).data._id;
        }

        await createMutation.mutateAsync({
          payload: { instantPrizeId: prizeId, quantity, competitionId },
        });
        toast.success("Instant prize assigned with winning numbers generated");
      }
      handleClose();
    } catch (err: unknown) {
      if (err instanceof ApiResponseError) {
        toast.error(err.message);
        setFieldErrors({ form: err.message });
      } else {
        const message = err instanceof Error ? err.message : "Failed to save";
        toast.error(message);
        setFieldErrors({ form: message });
      }
    }
  }

  const capacityErrorMessage =
    capacityError instanceof Error
      ? capacityError.message
      : "Unable to load capacity right now. Please retry.";

  const quantityControlDisabled = isQuantityControlDisabled({
    isPending,
    capacityLoading,
    hasCapacityError,
    hasAuthoritativeCapacity,
  });

  const canSubmit = canSubmitPrizeAssignment({
    isPending,
    hasAuthoritativeCapacity,
    hasCapacityError,
    maxAssignable,
    minQuantity,
    quantity,
    clampedMax,
    editing: !!editingCip,
    prizeMode,
    selectedPrizeId,
    linkedCompetitionId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCip
              ? "Edit instant prize"
              : step === 1
                ? "Add instant prize"
                : "Configure quantity"}
          </DialogTitle>
          <DialogDescription>
            {editingCip
              ? "Adjust quantity or ticket prize settings. Claimed slots cannot be removed."
              : step === 1
                ? "Choose an existing template or create a competition ticket prize."
                : "Set how many winning slots to add. Limits update live from ticket availability."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {fieldErrors.form && (
            <Alert variant="destructive">
              <AlertDescription>{fieldErrors.form}</AlertDescription>
            </Alert>
          )}

          {!editingCip && step === 1 && (
            <>
              <Tabs
                value={prizeMode}
                onValueChange={(v: string) => {
                  setPrizeMode(v as PrizeMode);
                  setFieldErrors({});
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="template">Existing template</TabsTrigger>
                  <TabsTrigger value="inline">Ticket prize</TabsTrigger>
                </TabsList>
              </Tabs>

              {prizeMode === "template" && (
                <div className="grid max-h-56 gap-2 overflow-y-auto">
                  {activeTemplates.map((t) => {
                    const selected = selectedPrizeId === t._id;
                    return (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => selectTemplate(t)}
                        className={`flex flex-col items-start rounded-lg border p-3 text-left text-sm transition-colors ${
                          selected ? "border-gold bg-gold/10" : "border-border hover:border-gold/40"
                        }`}
                      >
                        <span className="font-medium">{t.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {t.type === "competition_ticket" ? "Competition ticket" : "Prize"}
                          {t.value ? ` · £${t.value}` : ""}
                        </span>
                        {t.type === "competition_ticket" && t.linkedCompetition?.title && (
                          <span className="mt-0.5 text-xs text-muted-foreground/70">
                            → {t.linkedCompetition.title}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {activeTemplates.length === 0 && (
                    <p className="text-sm text-muted-foreground">No active prize templates.</p>
                  )}
                </div>
              )}

              {prizeMode === "inline" && (
                <FieldGroup>
                  <Field>
                    <FieldLabel>Linked competition</FieldLabel>
                    <AsyncCombobox
                      value={linkedCompetitionId}
                      onValueChange={setLinkedCompetitionId}
                      queryKey="linked-competition-inline"
                      fetchOptions={async (search: string) => {
                        const res = await api.get<{ _id: string; title: string }[]>(
                          "/api/admin/competitions",
                          {
                            params: { limit: 20, search, status: "active" },
                          }
                        );
                        return (res.data ?? [])
                          .filter((c) => c._id !== competitionId)
                          .map((c) => ({ value: c._id, label: c.title }));
                      }}
                      placeholder="Search competitions..."
                    />
                    {linkedCompetitionId && (
                      <AvailabilityBadge competitionId={linkedCompetitionId} />
                    )}
                    {fieldErrors.linkedCompetitionId && (
                      <p className="text-xs text-destructive">{fieldErrors.linkedCompetitionId}</p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Tickets per winning slot</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      value={ticketCount}
                      onChange={(e) =>
                        setTicketCount(Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                    />
                  </Field>
                </FieldGroup>
              )}

              {fieldErrors.prize && <p className="text-xs text-destructive">{fieldErrors.prize}</p>}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="button" onClick={goToStep2}>
                  Continue
                </Button>
              </DialogFooter>
            </>
          )}

          {(editingCip || step === 2) && (
            <>
              {!editingCip && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto justify-start p-0"
                  onClick={() => setStep(1)}
                >
                  ← Back to prize selection
                </Button>
              )}

              <InstantPrizeCapacityPanel capacity={capacity} isLoading={capacityLoading} />

              <div className="min-h-[3rem]" aria-live="polite">
                {hasCapacityError && (
                  <Alert variant="destructive">
                    <AlertDescription>{capacityErrorMessage}</AlertDescription>
                  </Alert>
                )}
                {capacityNotice && !hasCapacityError && (
                  <Alert>
                    <AlertDescription>{capacityNotice}</AlertDescription>
                  </Alert>
                )}
              </div>

              {editingCip &&
                isCompetitionTicketTemplate &&
                !editingCip.instantPrize?.linkedCompetitionId && (
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Linked competition</FieldLabel>
                      <AsyncCombobox
                        value={linkedCompetitionId}
                        onValueChange={setLinkedCompetitionId}
                        queryKey="linked-competition-edit"
                        fetchOptions={async (search: string) => {
                          const res = await api.get<{ _id: string; title: string }[]>(
                            "/api/admin/competitions",
                            {
                              params: { limit: 20, search, status: "active" },
                            }
                          );
                          return (res.data ?? [])
                            .filter((c) => c._id !== competitionId)
                            .map((c) => ({ value: c._id, label: c.title }));
                        }}
                        placeholder="Search competitions..."
                      />
                    </Field>
                  </FieldGroup>
                )}

              <Field>
                <FieldLabel htmlFor="cip-quantity">
                  {editingCip && quantity > editingCip.quantity
                    ? "Increase quantity"
                    : editingCip && quantity < editingCip.quantity
                      ? "Decrease quantity"
                      : "Quantity"}
                </FieldLabel>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={minQuantity}
                    max={clampedMax || quantity || minQuantity}
                    value={Math.min(quantity, clampedMax || quantity || minQuantity)}
                    disabled={quantityControlDisabled || clampedMax < minQuantity}
                    onChange={(e) => {
                      setCapacityNotice(null);
                      setQuantity(parseInt(e.target.value, 10));
                    }}
                    className="h-2 flex-1 cursor-pointer accent-[hsl(var(--gold))]"
                  />
                  <Input
                    id="cip-quantity"
                    type="number"
                    className="w-24"
                    min={minQuantity}
                    max={hasAuthoritativeCapacity ? clampedMax || minQuantity : undefined}
                    value={quantity}
                    disabled={quantityControlDisabled}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (!Number.isFinite(n)) return;
                      if (!hasAuthoritativeCapacity) return;
                      const nextQuantity = Math.min(clampedMax, Math.max(minQuantity, n));
                      if (nextQuantity !== n) {
                        setCapacityNotice(
                          capacity?.quantityMessage ??
                            `Quantity was reduced to ${nextQuantity} due to current capacity limits.`
                        );
                      } else {
                        setCapacityNotice(null);
                      }
                      setQuantity(nextQuantity);
                    }}
                  />
                </div>
                {editingCip && editingCip.claimedCount > 0 && (
                  <FieldDescription>
                    Minimum {editingCip.claimedCount} — that many slots are already claimed
                  </FieldDescription>
                )}
                {fieldErrors.quantity && (
                  <p className="text-xs text-destructive">{fieldErrors.quantity}</p>
                )}
              </Field>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSubmit} className="min-w-[7rem]">
                  {isPending ? (
                    <>
                      <Loader2 data-icon="inline-start" className="animate-spin" />
                      Saving...
                    </>
                  ) : editingCip ? (
                    "Save changes"
                  ) : (
                    "Add prize"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CompetitionInstantPrizesTab({
  competitionId,
  maxTickets,
  onAddPrize,
  onEditPrize,
}: CompetitionInstantPrizesTabProps) {
  const [deleteConfirmCip, setDeleteConfirmCip] = useState<CompetitionInstantPrize | null>(null);

  const { data: cipResponse, isLoading } =
    useAdminCompetitionInstantPrizeAssignments(competitionId);
  const cipList = (cipResponse?.data ?? []) as CompetitionInstantPrize[];
  const { deleteMutation, reorderMutation } = useAdminCompetitionInstantPrizeAssignmentMutations();
  const isPending = deleteMutation.isPending || reorderMutation.isPending;

  const totalAssigned = activeCipQuantity(cipList);
  const remainingCapacity = maxTickets - totalAssigned;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cipList.findIndex((c) => c.id === active.id);
    const newIndex = cipList.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(cipList, oldIndex, newIndex);
    const items = reordered.map((c, i) => ({ id: c.id, sortOrder: i }));

    reorderMutation.mutate({ competitionId, items });
  }

  async function confirmDelete() {
    if (!deleteConfirmCip || !competitionId) return;
    try {
      const result = await deleteMutation.mutateAsync({
        competitionId,
        id: deleteConfirmCip.id,
      });
      const archived = (result?.data as { archived?: boolean } | undefined)?.archived;
      toast.success(
        archived
          ? "Assignment archived — won tickets preserved"
          : "Instant prize assignment removed"
      );
    } catch (err: unknown) {
      if (err instanceof ApiResponseError) {
        toast.error(err.message);
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to remove assignment");
      }
    } finally {
      setDeleteConfirmCip(null);
    }
  }

  if (!competitionId) {
    return (
      <EmptyState
        icon={Trophy}
        title="Save the competition first"
        description="Instant prizes can be assigned after the competition is created."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-sm">Assigned Prizes</CardTitle>
            <CardDescription>
              Manage instant win prizes attached to this competition
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs text-muted-foreground">
              <p>
                <span
                  className={
                    totalAssigned >= maxTickets ? "font-medium text-destructive" : "text-foreground"
                  }
                >
                  {totalAssigned} / {maxTickets}
                </span>{" "}
                instant prize slots used
              </p>
              {remainingCapacity > 0 && (
                <p className="text-primary">{remainingCapacity} remaining</p>
              )}
            </div>
            <Button
              type="button"
              onClick={onAddPrize}
              disabled={maxTickets === 0 || remainingCapacity === 0}
            >
              <Plus data-icon="inline-start" />
              Add Prize
            </Button>
          </div>
        </CardHeader>
        {maxTickets > 0 && (
          <CardContent className="pt-0">
            <Progress value={Math.min((totalAssigned / maxTickets) * 100, 100)} className="h-2" />
          </CardContent>
        )}
      </Card>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : cipList.length === 0 ? (
        <EmptyState
          title="No instant prizes assigned"
          description="Add instant win prizes to this competition."
          action={{
            label: "Add your first prize",
            onClick: () => onAddPrize?.(),
          }}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cipList.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {cipList.map((cip) => (
                <PrizeEntryRow
                  key={cip.id}
                  cip={cip}
                  onEdit={() => onEditPrize?.(cip)}
                  onDelete={() => setDeleteConfirmCip(cip)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AdminConfirmDialog
        open={!!deleteConfirmCip}
        onOpenChange={(openState) => {
          if (!openState) setDeleteConfirmCip(null);
        }}
        title="Remove Instant Prize"
        description={
          deleteConfirmCip
            ? deleteConfirmCip.claimedCount > 0
              ? `Remove "${deleteConfirmCip.instantPrize?.title}"? This archives the assignment — ${deleteConfirmCip.claimedCount} won ticket${deleteConfirmCip.claimedCount !== 1 ? "s" : ""} stay visible.`
              : `Remove "${deleteConfirmCip.instantPrize?.title}"? Winning numbers and held tickets will be freed.`
            : "Remove this prize assignment?"
        }
        confirmLabel={deleteConfirmCip?.claimedCount ? "Archive" : "Remove"}
        isDestructive
        isLoading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
