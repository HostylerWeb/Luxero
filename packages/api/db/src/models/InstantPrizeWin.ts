import { type Document, Schema, type Types } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export interface IShippingAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country?: string;
}

export interface IInstantPrizeWin extends Document, ISoftDelete {
  competitionInstantPrizeId: Types.ObjectId;
  userId: Types.ObjectId;
  entryId: Types.ObjectId;
  ticketNumber: number;
  claimed: boolean;
  claimedAt?: Date;
  shippingAddress?: IShippingAddress;
  wonAt: Date;
  createdAt: Date;
  grantedTicketIds: Types.ObjectId[];
  /** @deprecated use grantedTicketIds — kept for API JSON alias */
  grantedEntryIds?: Types.ObjectId[];
}

const InstantPrizeWinSchema = new Schema<IInstantPrizeWin>(
  {
    competitionInstantPrizeId: {
      type: Schema.Types.ObjectId,
      ref: "CompetitionInstantPrize",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    entryId: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
    ticketNumber: { type: Number, required: true },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
    shippingAddress: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      postcode: String,
      country: String,
    },
    wonAt: { type: Date, default: Date.now },
    grantedTicketIds: { type: [Schema.Types.ObjectId], ref: "Ticket", default: [] },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

InstantPrizeWinSchema.index({ userId: 1 });
InstantPrizeWinSchema.index({ userId: 1, wonAt: -1 });
InstantPrizeWinSchema.index({ entryId: 1 });
InstantPrizeWinSchema.index({ entryId: 1, wonAt: -1 });
InstantPrizeWinSchema.index({ competitionInstantPrizeId: 1 });
InstantPrizeWinSchema.index({ competitionInstantPrizeId: 1, ticketNumber: 1 }, { unique: true });
InstantPrizeWinSchema.index({ wonAt: -1 }, { partialFilterExpression: { deletedAt: null } });
InstantPrizeWinSchema.index({ grantedTicketIds: 1 });

InstantPrizeWinSchema.plugin(softDeletePlugin);

export const InstantPrizeWin = m<IInstantPrizeWin>(
  "InstantPrizeWin",
  InstantPrizeWinSchema
) as SoftDeleteModel<IInstantPrizeWin>;
