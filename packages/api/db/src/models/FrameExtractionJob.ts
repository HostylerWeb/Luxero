import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export type FrameExtractionJobStatus = "pending" | "running" | "completed" | "failed" | "abandoned";

export interface IFrameExtractionJob extends Document, ISoftDelete {
  competitionId: mongoose.Types.ObjectId;
  videoUrl: string;
  status: FrameExtractionJobStatus;
  framesExtracted: number;
  framesTotal: number | null;
  percentage: number;
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  pid: number | null;
}

const FrameExtractionJobSchema = new Schema<IFrameExtractionJob>(
  {
    competitionId: {
      type: Schema.Types.ObjectId,
      ref: "Competition",
      required: true,
    },
    videoUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed", "abandoned"],
      default: "pending",
    },
    framesExtracted: { type: Number, default: 0 },
    framesTotal: { type: Number, default: null },
    percentage: { type: Number, default: 0 },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    errorMessage: { type: String, default: null },
    pid: { type: Number, default: null },
  },
  { timestamps: true }
);

FrameExtractionJobSchema.index({ competitionId: 1 });
FrameExtractionJobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

FrameExtractionJobSchema.plugin(softDeletePlugin);

export const FrameExtractionJob = m<IFrameExtractionJob>(
  "FrameExtractionJob",
  FrameExtractionJobSchema
) as SoftDeleteModel<IFrameExtractionJob>;
