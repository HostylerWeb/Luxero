import { ApiResponseError } from "../client";
import {
  buildContextualActionHref,
  type ContextualActionHrefParams,
} from "./contextual-action-href";
import {
  CONTEXTUAL_ERROR_DEFINITIONS,
  CONTEXTUAL_ERROR_ROUTES,
  FRONTEND_CONTEXTUAL_ERRORS,
} from "./contextual-error-definitions";
import type { ContextualError, ContextualErrorAction } from "./contextual-errors-types";

export type { ContextualError, ContextualErrorAction };
export {
  buildContextualActionHref,
  CONTEXTUAL_ERROR_DEFINITIONS,
  CONTEXTUAL_ERROR_ROUTES,
  type ContextualActionHrefParams,
  FRONTEND_CONTEXTUAL_ERRORS,
};

export function parsePrefixedErrorMessage(message: string): { code?: string; message: string } {
  const colonIndex = message.indexOf(":");
  if (colonIndex <= 0) return { message };

  const prefix = message.slice(0, colonIndex);
  if (prefix in CONTEXTUAL_ERROR_DEFINITIONS || prefix.startsWith("MAX_TICKETS")) {
    return {
      code: prefix,
      message: message.slice(colonIndex + 1),
    };
  }

  return { message };
}

export function resolveContextualError(
  code?: string | null,
  apiMessage?: string | null
): ContextualError {
  if (code) {
    const definition = CONTEXTUAL_ERROR_DEFINITIONS[code];
    if (definition) {
      return {
        code,
        message: definition.message,
        action: definition.action,
      };
    }
  }

  if (apiMessage && apiMessage.length > 0) {
    const parsed = parsePrefixedErrorMessage(apiMessage);
    if (parsed.code) {
      return resolveContextualError(parsed.code, parsed.message);
    }
    return { message: apiMessage, code: code ?? undefined };
  }

  return {
    message: "Something went wrong. Please try again.",
    code: code ?? undefined,
  };
}

export function resolveContextualErrorFromUnknown(err: unknown, fallback: string): ContextualError {
  if (err instanceof ApiResponseError) {
    const resolved = resolveContextualError(err.code, err.message);
    if (resolved.message !== "Something went wrong. Please try again.") {
      return resolved;
    }
  }

  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message?: string }).message;
    if (message && message.length > 0) {
      const code =
        "code" in err && typeof (err as { code: string }).code === "string"
          ? (err as { code: string }).code
          : undefined;
      const resolved = resolveContextualError(code, message);
      if (resolved.message !== "Something went wrong. Please try again.") {
        return resolved;
      }
    }
  }

  return { message: fallback };
}

/** @deprecated Use resolveContextualErrorFromUnknown(err, fallback).message */
export function getContextualErrorMessage(err: unknown, fallback: string): string {
  return resolveContextualErrorFromUnknown(err, fallback).message;
}
