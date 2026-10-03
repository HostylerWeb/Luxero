import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "marketing",
  "system",
  "draw_result",
  "promotional",
  "reminder",
]);

export const notificationTargetFilterSchema = z.object({
  allUsers: z.boolean().optional(),
  userIds: z.array(z.string()).optional(),
  subscriptionIds: z.array(z.string()).optional(),
  roles: z.array(z.string()).optional(),
});

export const sendNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(500),
  type: notificationTypeSchema,
  url: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  badge: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  targetFilter: notificationTargetFilterSchema.optional(),
  scheduleAt: z.string().datetime().optional(),
});

export const updateNotificationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(500).optional(),
  type: notificationTypeSchema.optional(),
  url: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  badge: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  scheduleAt: z.string().datetime().optional(),
});

export const pushPreferencesSchema = z.object({
  marketing: z.boolean().optional(),
  system: z.boolean().optional(),
  draw_result: z.boolean().optional(),
  promotional: z.boolean().optional(),
  reminder: z.boolean().optional(),
});

export const pushSubscribeSchema = z.object({
  endpoint: z.string().min(1),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
export type PushPreferencesInput = z.infer<typeof pushPreferencesSchema>;
export type PushSubscribeInput = z.infer<typeof pushSubscribeSchema>;
