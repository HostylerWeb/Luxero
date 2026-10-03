"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createZodResolver } from "@/lib/zod-resolver";

const sendSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required").max(500),
  type: z.enum(["marketing", "system", "draw_result", "promotional", "reminder"]),
  url: z.string().optional(),
  icon: z.string().optional(),
  targetType: z.enum(["all", "users", "devices"]).default("all"),
  targetUserIds: z.string().optional(),
  targetSubscriptionIds: z.string().optional(),
  allUsers: z.boolean().default(true),
  scheduleAt: z.string().optional(),
});

export type SendNotificationFormValues = z.infer<typeof sendSchema>;

interface SendNotificationFormProps {
  onSubmit: (values: SendNotificationFormValues) => void;
  isSubmitting: boolean;
}

export function SendNotificationForm({ onSubmit, isSubmitting }: SendNotificationFormProps) {
  const form = useForm<SendNotificationFormValues>({
    resolver: createZodResolver(sendSchema),
    defaultValues: {
      title: "",
      body: "",
      type: "marketing",
      url: "/",
      icon: "/icons/icon-192x192.svg",
      targetType: "all",
      targetUserIds: "",
      targetSubscriptionIds: "",
      allUsers: true,
      scheduleAt: "",
    },
  });

  const targetType = form.watch("targetType");

  const handleSubmit = form.handleSubmit((values) => {
    const scheduleDate = values.scheduleAt ? new Date(values.scheduleAt) : undefined;
    if (scheduleDate && scheduleDate <= new Date()) {
      toast.error("Schedule time must be in the future");
      return;
    }
    onSubmit({
      ...values,
      allUsers: values.targetType === "all",
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="New draw available!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your message..."
                  className="min-h-24 resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="draw_result">Draw Result</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Click URL</FormLabel>
              <FormControl>
                <Input placeholder="/promotions" {...field} />
              </FormControl>
              <FormDescription>Where users land when they tap the notification.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon URL</FormLabel>
              <FormControl>
                <Input placeholder="/icons/icon-192x192.svg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Target</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-2"
                >
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="all" />
                    </FormControl>
                    <FormLabel className="font-normal">All users</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="users" />
                    </FormControl>
                    <FormLabel className="font-normal">Specific users</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="devices" />
                    </FormControl>
                    <FormLabel className="font-normal">Specific devices</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {targetType === "users" && (
          <FormField
            control={form.control}
            name="targetUserIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User IDs</FormLabel>
                <FormControl>
                  <Input placeholder="user_id_1, user_id_2, ..." {...field} />
                </FormControl>
                <FormDescription>Comma-separated user IDs.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {targetType === "devices" && (
          <FormField
            control={form.control}
            name="targetSubscriptionIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subscription IDs</FormLabel>
                <FormControl>
                  <Input placeholder="sub_id_1, sub_id_2, ..." {...field} />
                </FormControl>
                <FormDescription>Comma-separated push subscription IDs.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="scheduleAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule (optional)</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>Leave empty to send immediately.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          data-umami-event="notification:send-submit"
        >
          {isSubmitting ? "Sending..." : "Send Notification"}
        </Button>
      </form>
    </Form>
  );
}
