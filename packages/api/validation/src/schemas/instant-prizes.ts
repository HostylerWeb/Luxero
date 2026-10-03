import { z } from "zod";
import { idSchema } from "./common";

export const createInstantPrizeSchema = z
  .object({
    title: z.string().min(1).max(300),
    description: z.string().max(2000).optional(),
    value: z.number().min(0).optional(),
    images: z.array(z.string().url()).max(20).default([]),
    isActive: z.boolean().optional().default(true),
    type: z.enum(["prize", "competition_ticket"]).optional().default("prize"),
    linkedCompetitionId: idSchema.optional(),
    ticketCount: z.number().int().min(1).max(10_000).optional(),
  })
  .refine((v) => (v.type === "competition_ticket" ? !!v.linkedCompetitionId : true), {
    path: ["linkedCompetitionId"],
    message: "Linked competition is required for ticket prizes",
  });

export const updateInstantPrizeSchema = z
  .object({
    title: z.string().min(1).max(300).optional(),
    description: z.string().max(2000).optional(),
    value: z.number().min(0).optional(),
    images: z.array(z.string().url()).max(20).optional(),
    isActive: z.boolean().optional(),
    type: z.enum(["prize", "competition_ticket"]).optional(),
    linkedCompetitionId: idSchema.optional().nullable(),
    ticketCount: z.number().int().min(1).max(10_000).optional().nullable(),
  })
  .refine((v) => (v.type === "competition_ticket" ? !!v.linkedCompetitionId : true), {
    path: ["linkedCompetitionId"],
    message: "Linked competition is required for ticket prizes",
  });

export const assignCompetitionInstantPrizeSchema = z.object({
  competitionId: idSchema,
  instantPrizeId: idSchema,
  quantity: z.number().int().min(1).max(10_000).default(1),
});

export const updateCompetitionInstantPrizeSchema = z
  .object({
    quantity: z.number().int().min(1).max(10_000).optional(),
    absolute: z.boolean().optional(),
    linkedCompetitionId: idSchema.optional(),
    ticketCount: z.number().int().min(1).max(10_000).optional(),
  })
  .refine(
    (data) =>
      data.quantity !== undefined ||
      data.linkedCompetitionId !== undefined ||
      data.ticketCount !== undefined,
    { message: "At least one field (quantity, linkedCompetitionId, ticketCount) must be provided" }
  );

export const instantPrizeCapacityQuerySchema = z.object({
  competitionId: idSchema,
  instantPrizeId: idSchema.optional(),
  quantity: z.coerce.number().int().min(1).max(10_000).optional(),
  linkedCompetitionId: idSchema.optional(),
  ticketCount: z.coerce.number().int().min(1).max(10_000).optional(),
  excludeCipId: idSchema.optional(),
});

export const reorderCompetitionInstantPrizesSchema = z.object({
  competitionId: idSchema,
  items: z
    .array(
      z.object({
        id: idSchema,
        sortOrder: z.number().int().min(0),
      })
    )
    .min(1)
    .max(500),
});

export type CreateInstantPrizeInput = z.infer<typeof createInstantPrizeSchema>;
export type UpdateInstantPrizeInput = z.infer<typeof updateInstantPrizeSchema>;

export type ReorderCompetitionInstantPrizesInput = z.infer<
  typeof reorderCompetitionInstantPrizesSchema
>;

export type AssignCompetitionInstantPrizeInput = z.infer<
  typeof assignCompetitionInstantPrizeSchema
>;
export type UpdateCompetitionInstantPrizeInput = z.infer<
  typeof updateCompetitionInstantPrizeSchema
>;
export type InstantPrizeCapacityQueryInput = z.infer<typeof instantPrizeCapacityQuerySchema>;
