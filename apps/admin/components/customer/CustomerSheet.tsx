"use client";

import {
  useAdminUser,
  useAdminUserBalance,
  useAdminUserCompliance,
  useAdminUserReferralMutation,
  useAdminUserReferralPurchases,
  useAdminUserReferralStats,
  useAuth,
} from "@luxero/api-admin";
import type { AdminReferralPurchase, Profile } from "@luxero/types";
import { getDisplayName } from "@luxero/utils";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormSheet } from "@/components/FormSheet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createZodResolver } from "@/lib/zod-resolver";
import { CustomerBalanceSection } from "./CustomerBalanceSection";
import { CustomerComplianceSection } from "./CustomerComplianceSection";
import { CustomerOrdersSection } from "./CustomerOrdersSection";
import { CustomerProfileSection } from "./CustomerProfileSection";
import { CustomerReferralHistory } from "./CustomerReferralHistory";
import { CustomerReferralSection } from "./CustomerReferralSection";
import { CustomerWinsSection } from "./CustomerWinsSection";

export interface CustomerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

function CustomerSheetSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <Skeleton className="size-16 shrink-0 rounded-xl" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="mt-1 flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function CustomerSheet({ open, onOpenChange, userId }: CustomerSheetProps) {
  const { role: currentRole } = useAuth();
  const isManager = currentRole === "manager";
  const { data: profileRes, isLoading: profileLoading } = useAdminUser(userId ?? "");
  const { data: referralStatsRes } = useAdminUserReferralStats(userId ?? "");
  const { data: complianceRes, isLoading: complianceLoading } = useAdminUserCompliance(
    userId ?? "",
    { enabled: !isManager }
  );
  const { data: balanceRes, isLoading: balanceLoading } = useAdminUserBalance(userId ?? "", {
    enabled: !isManager,
  });
  const { data: referralPurchasesRes, isLoading: referralPurchasesLoading } =
    useAdminUserReferralPurchases(userId ?? "");
  const referralPurchases = (referralPurchasesRes?.data ?? []) as AdminReferralPurchase[];

  const customer = profileLoading ? null : ((profileRes?.data ?? null) as Profile | null);
  const referralStats = referralStatsRes?.data ?? null;

  const isOverallLoading = profileLoading;

  const displayName = customer
    ? getDisplayName(
        {
          firstName: customer.firstName ?? undefined,
          lastName: customer.lastName ?? undefined,
        },
        customer.email ?? ""
      )
    : "Customer";

  const [reassignUserId, setReassignUserId] = useState<string | null>(null);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);

  const handleReassignReferral = useCallback((uid: string) => {
    setReassignUserId(uid);
    setReassignDialogOpen(true);
  }, []);

  const reassignMutation = useAdminUserReferralMutation();

  const reassignSchema = z.object({
    referralCode: z.string().optional(),
    action: z.enum(["set", "clear"]).default("set"),
  });
  type ReassignFormValues = z.infer<typeof reassignSchema>;

  const reassignForm = useForm<ReassignFormValues>({
    resolver: createZodResolver(reassignSchema),
    defaultValues: { referralCode: "", action: "set" },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)_auto]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            {isOverallLoading ? "Loading customer information..." : displayName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0">
          <div className="px-1 py-2">
            {isOverallLoading ? (
              <CustomerSheetSkeleton />
            ) : customer ? (
              <div className="flex flex-col gap-6">
                <CustomerProfileSection customer={customer} />

                <CustomerReferralSection
                  customer={customer}
                  referralStats={referralStats}
                  onReassignReferral={isManager ? undefined : handleReassignReferral}
                />

                <CustomerReferralHistory
                  purchases={referralPurchases}
                  isLoading={referralPurchasesLoading}
                />

                {!isManager && (
                  <>
                    <CustomerBalanceSection
                      balance={balanceRes?.data ?? null}
                      isLoading={balanceLoading}
                    />

                    <CustomerComplianceSection
                      compliance={complianceRes?.data ?? null}
                      isLoading={complianceLoading}
                    />
                  </>
                )}

                <CustomerOrdersSection customerId={customer._id} />

                <CustomerWinsSection customerId={customer._id} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <p className="text-sm text-muted-foreground">No customer data available.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <FormSheet
          open={reassignDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setReassignDialogOpen(false);
              setReassignUserId(null);
            }
          }}
          title="Reassign referral"
          onSubmit={reassignForm.handleSubmit((values) => {
            if (!reassignUserId) return;
            if (values.action === "clear") {
              reassignMutation.mutate(
                { userId: reassignUserId, action: "clear" as const },
                {
                  onSuccess: () => {
                    toast.success(`Referral cleared for ${customer?.email ?? "user"}`);
                    setReassignDialogOpen(false);
                    setReassignUserId(null);
                  },
                  onError: (err) => {
                    const msg = err instanceof Error ? err.message : "Failed";
                    toast.error(`Referral update failed: ${msg}`);
                  },
                }
              );
            } else if (values.referralCode) {
              reassignMutation.mutate(
                { userId: reassignUserId, referralCode: values.referralCode },
                {
                  onSuccess: () => {
                    toast.success(`Referral reassigned to ${values.referralCode}`);
                    setReassignDialogOpen(false);
                    setReassignUserId(null);
                  },
                  onError: (err) => {
                    const msg = err instanceof Error ? err.message : "Failed";
                    toast.error(`Referral update failed: ${msg}`);
                  },
                }
              );
            }
          })}
          isSubmitting={reassignMutation.isPending}
          submitLabel="Save"
        >
          <Form {...reassignForm}>
            <FormField
              control={reassignForm.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="set">Set referral code</SelectItem>
                      <SelectItem value="clear">Clear referral</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {reassignForm.watch("action") === "set" && (
              <FormField
                control={reassignForm.control}
                name="referralCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New referral code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter referral code..." {...field} />
                    </FormControl>
                    <FormDescription>
                      This user will be reassigned to this referral code.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </Form>
        </FormSheet>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
