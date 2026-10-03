import { type Document, Schema, type Types } from "mongoose";
import { m } from "../db";

export interface IBonusAwardWin extends Document {
  assignmentId: Types.ObjectId;
  bonusAwardId: Types.ObjectId;
  bonusAwardFireId: Types.ObjectId;
  competitionId: Types.ObjectId;
  userId: Types.ObjectId;
  entryId: Types.ObjectId;
  ticketNumber: number;
  prizeTitle: string;
  prizeValue: number;
  prizeImage?: string;
  wonAt: Date;
  notifiedAt?: Date;
  claimed: boolean;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const BonusAwardWinSchema = new Schema<IBonusAwardWin>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "CompetitionBonusAwardAssignment",
      required: true,
    },
    bonusAwardId: { type: Schema.Types.ObjectId, ref: "BonusAward", required: true },
    bonusAwardFireId: { type: Schema.Types.ObjectId, ref: "BonusAwardFire", required: true },
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    entryId: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
    ticketNumber: { type: Number, required: true, min: 1 },
    prizeTitle: { type: String, required: true },
    prizeValue: { type: Number, required: true, default: 0 },
    prizeImage: { type: String },
    wonAt: { type: Date, default: Date.now },
    notifiedAt: { type: Date },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

BonusAwardWinSchema.index({ bonusAwardFireId: 1, ticketNumber: 1 }, { unique: true });
BonusAwardWinSchema.index({ userId: 1 });
BonusAwardWinSchema.index({ userId: 1, wonAt: -1 });
BonusAwardWinSchema.index({ competitionId: 1, wonAt: -1 });
BonusAwardWinSchema.index({ competitionId: 1, ticketNumber: 1 }, { unique: true });
BonusAwardWinSchema.index({ entryId: 1 }, { sparse: true });
BonusAwardWinSchema.index({ deletedAt: 1 });

export const BonusAwardWin = m<IBonusAwardWin>("BonusAwardWin", BonusAwardWinSchema);
