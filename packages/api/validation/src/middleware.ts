import type { Context, Next } from "hono";
import type { ZodSchema } from "zod";
import { ErrorCodes } from "./lib/error-codes";

export async function validateBody<T>(c: Context, next: Next, schema: ZodSchema<T>) {
  try {
    const body = await c.req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        {
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Invalid request body",
            details: parsed.error.flatten(),
          },
        },
        400
      );
    }
    c.set("body", parsed.data);
  } catch {
    return c.json(
      { error: { code: ErrorCodes.VALIDATION_ERROR, message: "Invalid JSON body" } },
      400
    );
  }
  await next();
}

export async function validateQuery<T>(c: Context, next: Next, schema: ZodSchema<T>) {
  const query = c.req.query();
  const parsed = schema.safeParse(query);
  if (!parsed.success) {
    return c.json(
      {
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: "Invalid query parameters",
          details: parsed.error.flatten(),
        },
      },
      400
    );
  }
  c.set("query", parsed.data);
  await next();
}
