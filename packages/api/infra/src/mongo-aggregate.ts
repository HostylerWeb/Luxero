import type { Aggregate, Model, PipelineStage } from "mongoose";
import { mongoSecondaryReadsEnabled } from "./mongo-retention";
import { DEFAULT_AGGREGATE_MAX_TIME_MS } from "./mongo-query-options";

export type AggregateReadMode = "primary" | "secondaryPreferred";

export function aggregateOptions(
  maxTimeMS = DEFAULT_AGGREGATE_MAX_TIME_MS,
  readMode?: AggregateReadMode
): { maxTimeMS: number; readPreference?: "secondaryPreferred" } {
  const mode =
    readMode ?? (mongoSecondaryReadsEnabled() ? "secondaryPreferred" : "primary");
  if (mode === "secondaryPreferred") {
    return { maxTimeMS, readPreference: "secondaryPreferred" };
  }
  return { maxTimeMS };
}

export function modelAggregate<T>(
  model: Model<T>,
  pipeline: PipelineStage[],
  options?: { maxTimeMS?: number; readMode?: AggregateReadMode }
): Aggregate<unknown[]> {
  return model
    .aggregate(pipeline)
    .option(aggregateOptions(options?.maxTimeMS, options?.readMode));
}

/** Analytics / admin reports that tolerate replication lag. */
export function modelAggregateAnalytics<T>(
  model: Model<T>,
  pipeline: PipelineStage[],
  maxTimeMS = DEFAULT_AGGREGATE_MAX_TIME_MS
): Aggregate<unknown[]> {
  return modelAggregate(model, pipeline, {
    maxTimeMS,
    readMode: mongoSecondaryReadsEnabled() ? "secondaryPreferred" : "primary",
  });
}
