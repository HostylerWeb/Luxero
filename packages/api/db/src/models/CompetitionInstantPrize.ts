import { type Document, Schema, type Types } from "mongoose";
import { m } from "../db";

export interface ICompetitionInstantPrize extends Document {
  competitionId: Types.ObjectId;
  instantPrizeId: Types.ObjectId;
  winningEntryNumbers: number[];
  quantity: number;
  claimedCount: number;
  grantedTicketIds: Types.ObjectId[];
  /** @deprecated Use grantedTicketIds — kept for migration reads only */
  grantedEntryIds?: Types.ObjectId[];
  isArchived: boolean;
  sortOrder: number;
  createdAt: Date;
}

const CompetitionInstantPrizeSchema = new Schema<ICompetitionInstantPrize>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    instantPrizeId: { type: Schema.Types.ObjectId, ref: "InstantPrize", required: true },
    winningEntryNumbers: {
      type: [Number],
      default: [],
      validate: {
        validator: (v: number[]) => new Set(v).size === v.length,
        message: "winningEntryNumbers must not contain duplicate values",
      },
    },
    quantity: { type: Number, required: true, min: 1 },
    claimedCount: { type: Number, default: 0, min: 0 },
    grantedTicketIds: { type: [Schema.Types.ObjectId], ref: "Ticket", default: [] },
    isArchived: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

function validateCipInvariants(doc: ICompetitionInstantPrize): void {
  if (doc.winningEntryNumbers.length !== doc.quantity) {
    throw new Error(
      `winningEntryNumbers.length (${doc.winningEntryNumbers.length}) must equal quantity (${doc.quantity})`
    );
  }
  if (doc.quantity < doc.claimedCount) {
    throw new Error(`quantity (${doc.quantity}) must be >= claimedCount (${doc.claimedCount})`);
  }
  if (new Set(doc.winningEntryNumbers).size !== doc.winningEntryNumbers.length) {
    throw new Error("winningEntryNumbers must not contain duplicate values");
  }
  if (doc.isArchived && doc.quantity !== doc.claimedCount) {
    throw new Error(
      `archived CIP quantity (${doc.quantity}) must equal claimedCount (${doc.claimedCount})`
    );
  }
}

CompetitionInstantPrizeSchema.pre("save", function () {
  validateCipInvariants(this);
});

CompetitionInstantPrizeSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (!update) return;

  const doc = await this.model.findOne(this.getQuery()).lean();
  if (!doc) return;

  const merged = {
    ...doc,
    ...(update.$set as Record<string, unknown> | undefined),
    winningEntryNumbers:
      (update.$set as Record<string, unknown> | undefined)?.winningEntryNumbers ??
      update.winningEntryNumbers ??
      doc.winningEntryNumbers,
    quantity:
      (update.$set as Record<string, unknown> | undefined)?.quantity ??
      update.quantity ??
      doc.quantity,
    claimedCount:
      (update.$set as Record<string, unknown> | undefined)?.claimedCount ??
      update.claimedCount ??
      doc.claimedCount,
    isArchived:
      (update.$set as Record<string, unknown> | undefined)?.isArchived ??
      update.isArchived ??
      doc.isArchived ??
      false,
  } as ICompetitionInstantPrize;

  validateCipInvariants(merged);
});

CompetitionInstantPrizeSchema.index(
  { competitionId: 1, instantPrizeId: 1 },
  { unique: true, partialFilterExpression: { isArchived: false } }
);
CompetitionInstantPrizeSchema.index({ competitionId: 1, winningEntryNumbers: 1 });
CompetitionInstantPrizeSchema.index({ competitionId: 1 });
CompetitionInstantPrizeSchema.index({ grantedTicketIds: 1 });

export const CompetitionInstantPrize = m<ICompetitionInstantPrize>(
  "CompetitionInstantPrize",
  CompetitionInstantPrizeSchema
);
