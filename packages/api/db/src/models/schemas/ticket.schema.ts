import { Schema, type Types } from "mongoose";

export const TICKET_STATUSES = ["available", "reserved", "sold", "held"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export interface ITicketFields {
  competitionId: Types.ObjectId;
  number: number;
  status: TicketStatus;
  shuffleKey: number;
  ownerId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  orderNumber?: number;
  heldForCipId?: Types.ObjectId;
  answerIndex?: number;
  answerCorrect?: boolean;
  instantPrizeWinId?: Types.ObjectId;
  reservedAt?: Date;
  soldAt?: Date;
  entryFirstName?: string;
  entryLastName?: string;
  entryShowLastName?: boolean;
}

export function createTicketSchema() {
  const TicketSchema = new Schema<ITicketFields>(
    {
      competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
      number: { type: Number, required: true, min: 1 },
      status: { type: String, enum: TICKET_STATUSES, default: "available", required: true },
      shuffleKey: { type: Number, required: true },
      ownerId: { type: Schema.Types.ObjectId, ref: "Profile" },
      orderId: { type: Schema.Types.ObjectId, ref: "Order" },
      orderNumber: { type: Number },
      heldForCipId: { type: Schema.Types.ObjectId, ref: "CompetitionInstantPrize" },
      answerIndex: { type: Number },
      answerCorrect: { type: Boolean },
      instantPrizeWinId: { type: Schema.Types.ObjectId, ref: "InstantPrizeWin" },
      reservedAt: { type: Date },
      soldAt: { type: Date },
      entryFirstName: { type: String },
      entryLastName: { type: String },
      entryShowLastName: { type: Boolean },
    },
    { timestamps: false }
  );

  TicketSchema.index({ competitionId: 1, status: 1 });
  TicketSchema.index({ competitionId: 1, status: 1, number: 1 });
  TicketSchema.index({ ownerId: 1, status: 1, instantPrizeWinId: 1 }, { sparse: true });
  TicketSchema.index({ competitionId: 1, number: 1 }, { unique: true });
  TicketSchema.index({ competitionId: 1, status: 1, shuffleKey: 1 });
  TicketSchema.index({ ownerId: 1, competitionId: 1, status: 1 });
  TicketSchema.index({ ownerId: 1, status: 1, soldAt: -1 });
  TicketSchema.index({ orderId: 1 }, { sparse: true });
  TicketSchema.index({ orderId: 1, competitionId: 1 }, { sparse: true });
  TicketSchema.index({ orderId: 1, status: 1, number: 1 }, { sparse: true });
  TicketSchema.index({ heldForCipId: 1 }, { sparse: true });
  TicketSchema.index({ instantPrizeWinId: 1 }, { sparse: true });

  return TicketSchema;
}
