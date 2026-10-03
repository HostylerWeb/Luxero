import { z } from "zod";
import { idSchema } from "./common";

export const createWinnerSchema = z.object({
  competitionId: idSchema,
  ticketNumber: z.coerce.number().int().min(0),
  prizeTitle: z.string().optional(),
  prizeValue: z.number().min(0).optional(),
  displayName: z.string().optional(),
  location: z.string().optional(),
  testimonial: z.string().optional(),
  showFullName: z.boolean().optional(),
});

export type CreateWinnerInput = z.infer<typeof createWinnerSchema>;
