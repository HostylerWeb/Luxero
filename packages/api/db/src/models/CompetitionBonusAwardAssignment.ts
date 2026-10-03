import { type Document, Schema, type Types } from "mongoose";
import { m } from "../db";

export interface ICompetitionBonusAwardAssignment extends Document {
  competitionId: Types.ObjectId;
  bonusAwardId: Types.ObjectId;
  milestonePct: number;
  thresholdNumber: number;
  quantity: number;
  wonCount: number;
  firedAt?: Date;
  firedStatus?: "pending" | "drawn" | "no_eligible_tickets" | "failed";
  isArchived: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompetitionBonusAwardAssignmentSchema = new Schema<ICompetitionBonusAwardAssignment>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    bonusAwardId: { type: Schema.Types.ObjectId, ref: "BonusAward", required: true },
    milestonePct: { type: Number, required: true, min: 1, max: 99 },
    thresholdNumber: { type: Number, required: true, min: 1 },
    quantity: { type: Number, default: 1, min: 1, max: 100 },
    wonCount: { type: Number, default: 0, min: 0 },
    firedAt: { type: Date },
    firedStatus: {
      type: String,
      enum: ["pending", "drawn", "no_eligible_tickets", "failed"],
    },
    isArchived: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "Profile" },
  },
  { timestamps: true }
);

CompetitionBonusAwardAssignmentSchema.index(
  { competitionId: 1, milestonePct: 1 },
  { unique: true, partialFilterExpression: { isArchived: false } }
);
CompetitionBonusAwardAssignmentSchema.index({ competitionId: 1, isArchived: 1, firedAt: 1 });
CompetitionBonusAwardAssignmentSchema.index({ bonusAwardId: 1 });
CompetitionBonusAwardAssignmentSchema.index({ firedAt: 1 });
CompetitionBonusAwardAssignmentSchema.index({ competitionId: 1 });

export const CompetitionBonusAwardAssignment = m<ICompetitionBonusAwardAssignment>(
  "CompetitionBonusAwardAssignment",
  CompetitionBonusAwardAssignmentSchema
);
