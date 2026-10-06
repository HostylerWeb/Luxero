import { z } from "zod";

const scopeMapSchema = z.object({
  media_library: z.boolean().optional(),
  competition_prizes: z.boolean().optional(),
  landing_videos: z.boolean().optional(),
  avatars: z.boolean().optional(),
  og_images: z.boolean().optional(),
});

const imageSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  quality: z.number().int().min(1).max(100).optional(),
  maxWidth: z.number().int().min(320).max(8192).optional(),
  maxHeight: z.number().int().min(320).max(8192).optional(),
  scopes: scopeMapSchema.optional(),
});

const videoSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  quality: z.number().int().min(1).max(100).optional(),
  maxWidth: z.number().int().min(480).max(3840).optional(),
  preserveAudio: z.boolean().optional(),
  scopes: scopeMapSchema.optional(),
});

export const adminMediaConverterSettingsUpdateSchema = z.object({
  addonEnabled: z.boolean().optional(),
  image: imageSettingsSchema.optional(),
  video: videoSettingsSchema.optional(),
});

export type AdminMediaConverterSettingsUpdateInput = z.infer<
  typeof adminMediaConverterSettingsUpdateSchema
>;

export const adminMediaConverterBulkConvertSchema = z.object({
  keys: z.array(z.string().min(1)).min(1).max(20),
});

export const adminMediaConverterBulkVerifySchema = z.object({
  keys: z.array(z.string().min(1)).min(1).max(200),
});

export const adminMediaConverterBulkDeleteOriginalsSchema = z.object({
  keys: z.array(z.string().min(1)).min(1).max(200),
});
