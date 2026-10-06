import type { PipelineStage } from "mongoose";

export function matchNotDeleted(extra?: Record<string, unknown>): Record<string, unknown> {
  return { deletedAt: null, ...extra };
}

export function aggregateMatchNotDeleted(extra?: Record<string, unknown>): PipelineStage {
  return { $match: matchNotDeleted(extra) };
}
