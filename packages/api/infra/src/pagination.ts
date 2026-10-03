import type { Context } from "hono";
import type { Model, Schema } from "mongoose";

export function parsePagination(c: Context) {
  const rawLimit = parseInt(String(c.req.query("limit") || "20"), 10);
  const limit = Math.max(1, Math.min(Number.isNaN(rawLimit) ? 20 : rawLimit, 100));
  const page = Math.max(parseInt(c.req.query("page") || "1", 10), 1);
  const sortRaw = c.req.query("sort") || "desc";
  const sortDirection = sortRaw === "asc" ? 1 : -1;
  return { limit, page, skip: (page - 1) * limit, sortDirection };
}

export interface CursorPaginationOptions {
  defaultSortField?: string;
  defaultSortDir?: 1 | -1;
}

export function parseCursorPagination(
  c: { req: { query: (k: string) => string | undefined } },
  options: CursorPaginationOptions = {}
) {
  const { defaultSortField = "createdAt", defaultSortDir = -1 } = options;
  const limit = Math.min(parseInt(c.req.query("limit") || "20", 10), 100);
  const cursor = c.req.query("cursor") || undefined;
  const sortField = c.req.query("sortField") || defaultSortField;
  const sortDirRaw = c.req.query("sortDir") || (defaultSortDir === -1 ? "desc" : "asc");
  const sortDir = sortDirRaw === "asc" ? 1 : -1;
  return { limit, cursor, sortField, sortDir };
}

export function encodeCursor(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeCursor<T extends Record<string, unknown>>(cursor: string): T | null {
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function buildCursorFilter(
  sortField: string,
  sortDir: 1 | -1,
  cursorData: Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!cursorData || cursorData[sortField] == null) return null;
  const op = sortDir === -1 ? "$lt" : "$gt";
  const sortValue = cursorData[sortField];
  const idValue = cursorData._id;
  return {
    $or: [{ [sortField]: { [op]: sortValue } }, { [sortField]: sortValue, _id: { [op]: idValue } }],
  };
}

export function getNextCursor<T extends Record<string, unknown>>(
  items: T[],
  sortField: string,
  hasMore: boolean
): string | undefined {
  if (!hasMore || items.length === 0) return undefined;
  const last = items[items.length - 1]!;
  return encodeCursor({ [sortField]: last[sortField], _id: last._id });
}

export function inferSortableFields(schema: Schema): string[] {
  const fields: string[] = [];
  schema.eachPath((pathName, path) => {
    if (pathName === "_id" || pathName === "__v") return;
    const instance = path.instance;
    if (["String", "Number", "Date", "Boolean"].includes(instance)) {
      fields.push(pathName);
    }
  });
  return fields;
}

export interface ParseSortOptions {
  model?: Model<unknown>;
  fields?: string[];
  defaultSort: Record<string, 1 | -1>;
}

export function parseSort(
  c: { req: { query: (k: string) => string | undefined } },
  options: ParseSortOptions
): {
  sortField: string;
  sortDir: 1 | -1;
  sortObj: Record<string, 1 | -1>;
  sortableFields: string[];
} {
  if (!options.model && !options.fields) {
    throw new Error("parseSort requires either `model` or `fields`");
  }

  const allowedFields = options.model ? inferSortableFields(options.model.schema) : options.fields!;

  const rawField = c.req.query("sortField");
  const rawDir = c.req.query("sortDir");

  const defaultField = Object.keys(options.defaultSort)[0]!;
  const defaultDir = Object.values(options.defaultSort)[0] ?? -1;

  const sortField = rawField && allowedFields.includes(rawField) ? rawField : defaultField;
  const sortDir = rawDir === "asc" ? 1 : rawDir === "desc" ? -1 : defaultDir;

  return {
    sortField,
    sortDir,
    sortObj: { [sortField]: sortDir },
    sortableFields: allowedFields,
  };
}

export function isPaginationRequested(c: {
  req: { query: (k: string) => string | undefined };
}): boolean {
  const q = c.req.query.bind(c.req);
  return q("cursor") !== undefined || q("page") !== undefined || q("limit") !== undefined;
}

export interface ColumnSearchEntry {
  field: string;
  value: string;
  operator: "contains" | "eq" | "gt" | "gte" | "lt" | "lte";
}

export interface ParseSearchOptions {
  searchableFields?: readonly string[];
  filterableFields?: readonly string[];
}

export function parseSearch(
  c: { req: { url: string; query: (k: string) => string | undefined } },
  _options: ParseSearchOptions = {}
): {
  columnSearch: ColumnSearchEntry[];
  globalSearch: string | undefined;
} {
  const columnSearch: ColumnSearchEntry[] = [];
  let globalSearch: string | undefined;

  const url = new URL(c.req.url);
  const rawParams: Record<string, string> = {};
  url.searchParams.forEach((val, key) => {
    rawParams[key] = val;
  });

  for (const [key, value] of Object.entries(rawParams)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "search" || key === "q") {
      globalSearch = value;
    } else if (key.startsWith("search[")) {
      const end = key.indexOf("]");
      if (end > 7) {
        const withoutBrackets = key.slice(7, end);
        const bracketIdx = withoutBrackets.indexOf("[");
        if (bracketIdx === -1) {
          columnSearch.push({ field: withoutBrackets, value, operator: "contains" });
        } else {
          const field = withoutBrackets.slice(0, bracketIdx);
          const op = withoutBrackets.slice(bracketIdx + 1, withoutBrackets.length - 1);
          const opMap: Record<string, ColumnSearchEntry["operator"]> = {
            gte: "gte",
            lte: "lte",
            gt: "gt",
            lt: "lt",
            eq: "eq",
          };
          const operator = opMap[op] ?? "contains";
          columnSearch.push({ field, value, operator });
        }
      }
    } else if (key.startsWith("filter[")) {
      const end = key.indexOf("]");
      if (end > 8) {
        const withoutBrackets = key.slice(8, end);
        const bracketIdx = withoutBrackets.indexOf("[");
        if (bracketIdx === -1) {
          columnSearch.push({ field: withoutBrackets, value, operator: "contains" });
        } else {
          const field = withoutBrackets.slice(0, bracketIdx);
          const op = withoutBrackets.slice(bracketIdx + 1, withoutBrackets.length - 1);
          const opMap: Record<string, ColumnSearchEntry["operator"]> = {
            gte: "gte",
            lte: "lte",
            gt: "gt",
            lt: "lt",
            eq: "eq",
          };
          const operator = opMap[op] ?? "contains";
          columnSearch.push({ field, value, operator });
        }
      }
    }
  }

  return { columnSearch, globalSearch };
}

export function buildColumnSearchQuery(
  columnSearch: ColumnSearchEntry[],
  _searchableFields: readonly string[],
  query: Record<string, unknown>
): void {
  if (columnSearch.length === 0) return;

  const conditions: Record<string, unknown>[] = [];

  for (const entry of columnSearch) {
    if (!entry.value || entry.value.trim() === "") continue;

    if (entry.operator === "contains") {
      const safe = escapeRegex(entry.value);
      conditions.push({ [entry.field]: { $regex: safe, $options: "i" } });
    } else if (entry.operator === "eq") {
      conditions.push({ [entry.field]: entry.value });
    } else {
      const opMap: Record<ColumnSearchEntry["operator"], string> = {
        gt: "$gt",
        gte: "$gte",
        lt: "$lt",
        lte: "$lte",
        contains: "$regex",
        eq: "$eq",
      };
      conditions.push({ [entry.field]: { [opMap[entry.operator]]: entry.value } });
    }
  }

  const existingAnd = (query.$and as unknown[]) ?? [];
  query.$and = [...existingAnd, ...conditions];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
