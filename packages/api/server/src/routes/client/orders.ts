import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { error } from "@luxero/api-infra/response";
import { auth } from "@luxero/api-server/middleware/auth";
import { Hono } from "hono";

const app = new Hono();

const DEPRECATED_MESSAGE = "This endpoint is deprecated. Use POST /api/payments/session instead.";

app.all("*", auth, (c) => {
  return error(c, ErrorCodes.CHECKOUT_ERROR, DEPRECATED_MESSAGE, 410);
});

export default app;
