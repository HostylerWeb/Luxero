import type { z } from "zod";

export function readNamedFieldValue(
  e: React.FormEvent<HTMLFormElement> | HTMLFormElement,
  name: string
): string {
  const form = e instanceof HTMLFormElement ? e : e.currentTarget;
  const fd = new FormData(form);
  return (fd.get(name) as string) ?? "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldErrorValue = { message?: string; type?: string };

export function zodV4Resolver<T extends z.ZodTypeAny>(schema: T) {
  return async (values: Record<string, unknown>) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const issues = "issues" in result.error ? (result.error.issues as z.ZodIssue[]) : [];
    const errors: Record<string, FieldErrorValue> = {};
    for (const issue of issues) {
      const path = issue.path.join(".");
      if (!errors[path]) {
        errors[path] = { message: issue.message, type: issue.code };
      }
    }
    return { values: {}, errors };
  };
}
