import { z } from "zod";

const homepageSectionIdSchema = z.enum([
  "hero",
  "ending_soon",
  "categories",
  "winners",
  "built_different",
  "cta",
]);

const homepageSectionConfigSchema = z.object({
  id: homepageSectionIdSchema,
  enabled: z.boolean(),
});

export const homepageLayoutSettingsUpdateSchema = z
  .object({
    sections: z.array(homepageSectionConfigSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const ids = data.sections.map((section) => section.id);
    const uniqueIds = new Set(ids);

    if (uniqueIds.size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Section ids must be unique",
        path: ["sections"],
      });
    }

    if (!data.sections.some((section) => section.enabled)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one section must be enabled",
        path: ["sections"],
      });
    }

    const hero = data.sections.find((section) => section.id === "hero");
    if (hero && !hero.enabled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The hero section must remain enabled",
        path: ["sections"],
      });
    }
  });

export type HomepageLayoutSettingsUpdateInput = z.infer<typeof homepageLayoutSettingsUpdateSchema>;
