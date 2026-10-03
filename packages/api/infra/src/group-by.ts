import type { PipelineStage } from "mongoose";

export interface GroupByFieldConfig {
  groupKey: string;
  groupLabel: string;
  labelLookup?: PipelineStage[];
}

export interface GroupByResult {
  dataPipeline: PipelineStage[];
  countPipeline: PipelineStage[];
  isGrouped: boolean;
}

export function applyGroupBy(
  basePipeline: PipelineStage[],
  baseCountPipelineWithoutCount: PipelineStage[],
  groupBy: string | undefined,
  configMap: Record<string, GroupByFieldConfig>,
  page: number,
  limit: number,
  sortObj: Record<string, 1 | -1>,
  sortDir: 1 | -1
): GroupByResult {
  const skip = (page - 1) * limit;

  if (!groupBy || !configMap[groupBy]) {
    return {
      dataPipeline: [...basePipeline, { $sort: sortObj }, { $skip: skip }, { $limit: limit }],
      countPipeline: [...baseCountPipelineWithoutCount, { $count: "total" }],
      isGrouped: false,
    };
  }

  const config = configMap[groupBy];

  const dataPipeline: PipelineStage[] = [
    ...basePipeline,
    { $sort: sortObj },
    {
      $group: {
        _id: config.groupKey,
        items: { $push: "$$ROOT" },
        count: { $sum: 1 },
        key: { $first: config.groupLabel },
      },
    },
    { $sort: { key: sortDir, _id: sortDir } },
    { $skip: skip },
    { $limit: limit },
    ...(config.labelLookup ?? []),
  ];

  const countPipeline: PipelineStage[] = [
    ...baseCountPipelineWithoutCount,
    { $group: { _id: config.groupKey } },
    { $count: "total" },
  ];

  return { dataPipeline, countPipeline, isGrouped: true };
}
