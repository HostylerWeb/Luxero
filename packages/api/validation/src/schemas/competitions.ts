import { z } from "zod";

const COMPETITION_MAX_TICKETS_LIMIT = 1_000_000;

export const createCompetitionSchema = z
  .object({
    title: z.string().min(1).max(200),
    slug: z.string().min(1).optional(),
    shortDescription: z.string().optional(),
    description: z.string().min(1),
    category: z.string().min(1).max(64),
    status: z
      .enum(["draft", "active", "paused", "ended", "pending_draw", "drawn", "cancelled"])
      .optional(),
    ticketPrice: z.number().min(0),
    originalPrice: z.number().min(0).optional(),
    prizeValue: z.number().min(0),
    maxTickets: z.number().int().min(1).max(COMPETITION_MAX_TICKETS_LIMIT),
    maxTicketsPerUser: z.number().int().min(0).optional(),
    endDate: z.string().datetime().optional(),
    drawDate: z.string().datetime().optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
    heroImageUrl: z.string().url().optional().or(z.literal("")),
    ogImageUrl: z.string().url().optional().or(z.literal("")),
    refOgImageUrl: z.string().url().optional().or(z.literal("")),
    prizeImages: z.array(z.string()).optional(),
    question: z.string().optional(),
    questionOptions: z.array(z.string()).optional(),
    correctAnswer: z.number().int().min(0).optional(),
    isFeatured: z.boolean().optional(),
    isCashOnly: z.boolean().optional(),
    requireSignIn: z.boolean().optional(),
    displayOrder: z.number().int().optional(),
    currency: z.enum(["GBP", "EUR"]).default("GBP"),
  })
  .passthrough();

export const updateCompetitionSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    category: z.string().optional(),
    ticketPrice: z.number().min(0).optional(),
    originalPrice: z.number().min(0).optional(),
    maxTickets: z.number().int().min(1).max(COMPETITION_MAX_TICKETS_LIMIT).optional(),
    maxTicketsPerUser: z.number().int().min(0).optional(),
    endDate: z.string().datetime().optional(),
    drawDate: z.string().datetime().optional(),
    question: z.string().optional(),
    questionOptions: z.array(z.string()).optional(),
    correctAnswer: z.number().int().min(0).optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
    heroImageUrl: z.string().url().optional().or(z.literal("")),
    ogImageUrl: z.string().url().optional().or(z.literal("")),
    refOgImageUrl: z.string().url().optional().or(z.literal("")),
    prizeImageUrl: z.string().url().optional().or(z.literal("")),
    prizeImages: z.array(z.string()).optional(),
    prizeImagesRemote: z.array(z.string().url()).optional(),
    prizeImagesSource: z.string().optional(),
    landingPageVideoUrl: z.string().url().optional().or(z.literal("")),
    isFeatured: z.boolean().optional(),
    isCashOnly: z.boolean().optional(),
    requireSignIn: z.boolean().optional(),
    displayOrder: z.number().int().optional(),
    status: z
      .enum(["draft", "active", "paused", "ended", "pending_draw", "drawn", "cancelled"])
      .optional(),
    currency: z.enum(["GBP", "EUR"]).optional(),
  })
  .passthrough();

export type CreateCompetitionInput = z.infer<typeof createCompetitionSchema>;
export type UpdateCompetitionInput = z.infer<typeof updateCompetitionSchema>;
