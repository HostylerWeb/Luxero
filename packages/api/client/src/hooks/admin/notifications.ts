import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../client";
import { STALE_TIME_ADMIN } from "../../constants";
import { queryKeys } from "../../keys";

interface NotificationsListParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export function useAdminNotifications(params: NotificationsListParams = {}) {
  const { page = 1, limit = 20, type = "", status = "" } = params;
  return useQuery({
    queryKey: queryKeys.admin.notifications(page, type, status),
    queryFn: () =>
      api.get("/api/admin/notifications", {
        params: { page, limit, ...(type && { type }), ...(status && { status }) },
      }),
    staleTime: STALE_TIME_ADMIN,
  });
}

export function useAdminNotification(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.notification(id),
    queryFn: () => api.get(`/api/admin/notifications/${id}`),
    enabled: !!id,
    staleTime: STALE_TIME_ADMIN,
  });
}

export function useAdminPushSubscriptions(params: { page?: number; search?: string } = {}) {
  const { page = 1, search = "" } = params;
  return useQuery({
    queryKey: queryKeys.admin.pushSubscriptions(page, search),
    queryFn: () => api.get("/api/admin/notifications/subscriptions", { params }),
    staleTime: STALE_TIME_ADMIN,
  });
}

export function useAdminPushSubscriptionMutations() {
  const qc = useQueryClient();
  return {
    deactivateSubscription: useMutation({
      mutationFn: (id: string) => api.delete(`/api/admin/notifications/subscriptions/${id}`),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "notifications", "subscriptions"] });
      },
    }),
  };
}

export function useAdminNotificationStats() {
  return useQuery({
    queryKey: queryKeys.admin.notificationStats(),
    queryFn: () => api.get("/api/admin/notifications/stats"),
    staleTime: STALE_TIME_ADMIN,
  });
}

export function useAdminNotificationMutations() {
  const qc = useQueryClient();
  return {
    sendMutation: useMutation({
      mutationFn: (payload: Record<string, unknown>) =>
        api.post("/api/admin/notifications/send", payload),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
        qc.invalidateQueries({ queryKey: ["admin", "notifications", "stats"] });
      },
    }),
    updateMutation: useMutation({
      mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
        api.put(`/api/admin/notifications/${id}`, payload),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
      },
    }),
    deleteMutation: useMutation({
      mutationFn: (id: string) => api.delete(`/api/admin/notifications/${id}`),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
      },
    }),
    resendMutation: useMutation({
      mutationFn: (id: string) => api.post(`/api/admin/notifications/${id}/resend`),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
        qc.invalidateQueries({ queryKey: ["admin", "notifications", "stats"] });
      },
    }),
  };
}
