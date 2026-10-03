import type { z } from "zod";

export function createZodResolver<T extends z.ZodType>(schema: T) {
  return (values: unknown) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} } as const;
    }

    const fieldErrors: Record<string, { message: string; type?: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = { message: issue.message, type: issue.code };
      }
    }
    return { values: {}, errors: fieldErrors } as const;
  };
}
