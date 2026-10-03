import { ShopOrder } from "@luxero/api-db/models";
import dbConnect from "@luxero/api-infra/db";
import { ErrorCodes } from "@luxero/api-infra/error-codes";
import { escapeRegex } from "@luxero/api-infra/fuzzy-search";
import { parsePagination, parseSort } from "@luxero/api-infra/pagination";
import { error, paginated, success } from "@luxero/api-infra/response";
import { captureRouteError } from "@luxero/api-infra/sentry";
import { requireManager } from "@luxero/api-server/middleware/auth";
import {
  type ShopOrderUpdateStatusInput,
  shopOrderUpdateStatusSchema,
  validateBody,
} from "@luxero/api-validation";
import { Hono } from "hono";
import mongoose from "mongoose";

const app = new Hono();

app.use("*", requireManager);

app.get("/", async (c) => {
  try {
    const { limit, page } = parsePagination(c);
    const { sortObj, sortableFields } = parseSort(c, {
      fields: ["orderNumber", "status", "total", "email", "createdAt"],
      defaultSort: { createdAt: -1 },
    });
    await dbConnect();

    const query: Record<string, unknown> = {};

    const status = c.req.query("status");
    if (status) query.status = status;

    const search = c.req.query("search")?.trim();
    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { email: { $regex: safe, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$orderNumber" },
              regex: safe,
              options: "i",
            },
          },
        },
      ];
    }

    const [orders, totalResult] = await Promise.all([
      ShopOrder.find(query)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ShopOrder.countDocuments(query),
    ]);

    const total = typeof totalResult === "number" ? totalResult : 0;

    return paginated(c, orders, total, page, limit, { sortableFields });
  } catch (err: unknown) {
    console.error("Error listing shop orders:", err);
    captureRouteError(err, {
      requestId: c.get("requestId"),
      path: c.req.path,
      userId: c.get("userId") ?? null,
      operation: "admin.shop.orders.list",
    });
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
    }

    const order = await ShopOrder.findById(id).lean();

    if (!order) {
      return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
    }

    return success(c, order);
  } catch (err: unknown) {
    console.error("Error fetching shop order:", err);
    captureRouteError(err, {
      requestId: c.get("requestId"),
      path: c.req.path,
      userId: c.get("userId") ?? null,
      operation: "admin.shop.orders.getOne",
    });
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});

app.put(
  "/:id/status",
  async (c, next) => validateBody(c, next, shopOrderUpdateStatusSchema),
  async (c) => {
    try {
      const id = c.req.param("id");
      const body = c.get("body") as ShopOrderUpdateStatusInput;
      await dbConnect();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
      }

      const existing = await ShopOrder.findById(id).lean();
      if (!existing) {
        return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
      }

      const updateFields: Record<string, unknown> = { status: body.status };
      if (body.notes) {
        updateFields.notes = body.notes;
      }

      const order = await ShopOrder.findByIdAndUpdate(
        id,
        { $set: updateFields },
        {
          returnDocument: "after",
        }
      ).lean();

      return success(c, order);
    } catch (err: unknown) {
      console.error("Error updating shop order status:", err);
      captureRouteError(err, {
        requestId: c.get("requestId"),
        path: c.req.path,
        userId: c.get("userId") ?? null,
        operation: "admin.shop.orders.updateStatus",
      });
      return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
    }
  }
);

export default app;
