import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export interface IUndrawEntry {
  undrawnAt: Date;
  undrawnBy: mongoose.Types.ObjectId;
  reason: "technical_error" | "wrong_winner" | "system_bug";
  note: string;
}

export type CompetitionStatus =
  | "draft"
  | "active"
  | "paused"
  | "ended"
  | "pending_draw"
  | "drawn"
  | "cancelled";

export interface ICompetition extends Document, ISoftDelete {
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  isCashOnly?: boolean;
  status: CompetitionStatus;
  prizeValue: number;
  prizeImageUrl?: string;
  prizeImages?: string[];
  prizeImagesSource?: string;
  prizeImagesRemote?: string[];
  prizeSpecifications?: Record<string, unknown>;
  ticketPrice: number;
  maxTickets: number;
  ticketsSold: number;
  ticketsHeld: number;
  maxTicketsPerUser: number;
  question?: string;
  questionOptions?: string[];
  correctAnswer?: number;
  startDate?: Date;
  endDate?: Date;
  drawDate?: Date;
  isFeatured: boolean;
  displayOrder: number;
  isHeroFeatured: boolean;
  heroDisplayOrder?: number;
  heroImageUrl?: string;
  ogImageUrl?: string;
  refOgImageUrl?: string;
  originalPrice?: number;
  imageUrl?: string;
  landingPageVideoUrl?: string;
  landingPageVideoFramesPrefix?: string | null;
  landingPageVideoFrameCount?: number | null;
  landingPageVideoFps?: number | null;
  landingPageVideoMetadata?: Record<string, unknown> | null;
  frameExtractionJobId?: mongoose.Types.ObjectId | null;
  currency: string;
  winnerId?: mongoose.Types.ObjectId;
  winnerTicketNumber?: number;
  winnerAnnouncedAt?: Date;
  undrawHistory?: IUndrawEntry[];
  requireSignIn?: boolean;
  isReferralReward: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompetitionSchema = new Schema<ICompetition>(
  {
    slug: { type: String, required: true },
    title: { type: String, required: true },
    shortDescription: { type: String },
    description: { type: String },
    category: { type: String },
    isCashOnly: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "ended", "pending_draw", "drawn", "cancelled"],
      default: "draft",
    },
    prizeValue: { type: Number, required: true },
    prizeImageUrl: { type: String },
    prizeImages: [{ type: String }],
    prizeSpecifications: { type: Schema.Types.Mixed },
    ticketPrice: { type: Number, required: true },
    maxTickets: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },
    ticketsHeld: { type: Number, default: 0 },
    maxTicketsPerUser: { type: Number, default: 100 },
    question: { type: String },
    questionOptions: [{ type: String }],
    correctAnswer: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    drawDate: { type: Date },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    isHeroFeatured: { type: Boolean, default: false },
    heroDisplayOrder: { type: Number },
    heroImageUrl: { type: String },
    ogImageUrl: { type: String },
    refOgImageUrl: { type: String },
    originalPrice: { type: Number },
    imageUrl: { type: String },
    landingPageVideoUrl: { type: String },
    landingPageVideoFramesPrefix: { type: String },
    landingPageVideoFrameCount: { type: Number },
    landingPageVideoFps: { type: Number },
    landingPageVideoMetadata: { type: Schema.Types.Mixed },
    frameExtractionJobId: { type: Schema.Types.ObjectId, ref: "FrameExtractionJob" },
    currency: { type: String, default: "GBP" },
    winnerId: { type: Schema.Types.ObjectId, ref: "Profile" },
    winnerTicketNumber: { type: Number },
    winnerAnnouncedAt: { type: Date },
    undrawHistory: [
      {
        undrawnAt: { type: Date, required: true },
        undrawnBy: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
        reason: {
          type: String,
          enum: ["technical_error", "wrong_winner", "system_bug"],
          required: true,
        },
        note: { type: String, required: true },
      },
    ],
    requireSignIn: { type: Boolean, default: false },
    isReferralReward: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "Profile" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

CompetitionSchema.pre("save", function () {
  if (this.endDate && this.startDate && this.endDate <= this.startDate) {
    throw new Error("endDate must be later than startDate");
  }
  if (this.drawDate && this.startDate && this.drawDate <= this.startDate) {
    throw new Error("drawDate must be later than startDate");
  }
  if (this.drawDate && this.status === "active" && this.drawDate <= new Date()) {
    throw new Error("drawDate must be in the future when status is active");
  }
});

CompetitionSchema.index({ status: 1, category: 1 });
CompetitionSchema.index({ drawDate: 1 });
CompetitionSchema.index({ isFeatured: 1 });
CompetitionSchema.index({ endDate: 1, status: 1 });
CompetitionSchema.index({ createdAt: -1 });
CompetitionSchema.index({ status: 1, displayOrder: 1, drawDate: 1 });
CompetitionSchema.index({ status: 1, isFeatured: 1, displayOrder: 1, drawDate: 1 });
CompetitionSchema.index({ status: 1, isFeatured: 1, heroDisplayOrder: 1, drawDate: 1 });
CompetitionSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

CompetitionSchema.plugin(softDeletePlugin);

export const Competition = m<ICompetition>(
  "Competition",
  CompetitionSchema
) as SoftDeleteModel<ICompetition>;
