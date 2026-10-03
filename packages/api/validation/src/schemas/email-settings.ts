import { z } from "zod";

export const emailSettingsUpdateSchema = z.object({
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
  supportAddress: z.string().optional(),
  social: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      whatsapp: z.string().optional(),
      telegram: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional(),
});

export type EmailSettingsUpdateInput = z.infer<typeof emailSettingsUpdateSchema>;
