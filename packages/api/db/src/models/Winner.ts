import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export interface IWinner extends Document, ISoftDelete {
  competitionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  entryId?: mongoose.Types.ObjectId;
  ticketNumber: number;
  prizeTitle?: string;
  prizeValue?: number;
  prizeImageUrl?: string;
  displayName?: string;
  location?: string;
  testimonial?: string;
  winnerPhotoUrl?: string;
  showFullName: boolean;
  claimed: boolean;
  claimedAt?: Date;
  notifiedAt?: Date;
  drawnAt: Date;
  createdAt: Date;
}

const WinnerSchema = new Schema<IWinner>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    entryId: { type: Schema.Types.ObjectId, ref: "Ticket" },
    ticketNumber: { type: Number, required: true },
    prizeTitle: { type: String },
    prizeValue: { type: Number },
    prizeImageUrl: { type: String },
    displayName: { type: String },
    location: { type: String },
    testimonial: { type: String },
    winnerPhotoUrl: { type: String },
    showFullName: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
    notifiedAt: { type: Date },
    drawnAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

WinnerSchema.index({ competitionId: 1 });
WinnerSchema.index({ userId: 1 });
WinnerSchema.index({ userId: 1, drawnAt: -1 });
WinnerSchema.index({ competitionId: 1, drawnAt: -1 });
WinnerSchema.index({ competitionId: 1, ticketNumber: 1 }, { unique: true });
WinnerSchema.index({ entryId: 1 }, { sparse: true });
WinnerSchema.index({ drawnAt: -1 }, { partialFilterExpression: { deletedAt: null } });

WinnerSchema.plugin(softDeletePlugin);

export const Winner = m<IWinner>("Winner", WinnerSchema) as SoftDeleteModel<IWinner>;
