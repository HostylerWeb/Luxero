import { type Document, Schema, type Types } from "mongoose";
import { m } from "../db";

export interface IBonusAwardFire extends Document {
  assignmentId: Types.ObjectId;
  bonusAwardId: Types.ObjectId;
  competitionId: Types.ObjectId;
  milestonePct: number;
  ticketsSoldAtFire: number;
  firedAt: Date;
  status: "pending" | "drawing" | "drawn" | "no_eligible_tickets" | "failed";
  drawnAt?: Date;
  error?: string;
  createdAt: Date;
}

const BonusAwardFireSchema = new Schema<IBonusAwardFire>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "CompetitionBonusAwardAssignment",
      required: true,
    },
    bonusAwardId: { type: Schema.Types.ObjectId, ref: "BonusAward", required: true },
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    milestonePct: { type: Number, required: true },
    ticketsSoldAtFire: { type: Number, required: true },
    firedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "drawing", "drawn", "no_eligible_tickets", "failed"],
      default: "pending",
    },
    drawnAt: { type: Date },
    error: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

BonusAwardFireSchema.index({ assignmentId: 1 }, { unique: true });
BonusAwardFireSchema.index({ competitionId: 1, firedAt: -1 });
BonusAwardFireSchema.index({ status: 1 });

export const BonusAwardFire = m<IBonusAwardFire>("BonusAwardFire", BonusAwardFireSchema);
