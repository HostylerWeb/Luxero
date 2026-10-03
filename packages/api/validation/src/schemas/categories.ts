import { z } from "zod";

const categoryIconNameSchema = z.enum(["Smartphone", "Car", "Watch", "Zap", "Trophy"]);

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).optional(),
  iconName: categoryIconNameSchema.optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const categoryUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    label: z.string().trim().min(1).optional(),
    iconName: categoryIconNameSchema.optional(),
    description: z.string().trim().optional(),
    isActive: z.boolean().optional(),
    displayOrder: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const categoryReorderSchema = z.object({
  orderedIds: z.array(z.string().length(24)).min(1),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type CategoryReorderInput = z.infer<typeof categoryReorderSchema>;
