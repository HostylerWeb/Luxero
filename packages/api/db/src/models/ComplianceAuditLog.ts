import mongoose, { type Document, type Model, Schema } from "mongoose";

export type ComplianceAuditSource = "admin" | "user";

export interface IComplianceAuditLog extends Document {
  actorId: string | null;
  targetUserId: string | null;
  action: string;
  reason: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  source: ComplianceAuditSource;
  createdAt: Date;
}

const ComplianceAuditLogSchema = new Schema<IComplianceAuditLog>(
  {
    actorId: { type: String, default: null },
    targetUserId: { type: String, default: null, index: true },
    action: { type: String, required: true },
    reason: { type: String, required: true },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    source: { type: String, enum: ["admin", "user"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ComplianceAuditLogSchema.index({ targetUserId: 1, createdAt: -1 });
ComplianceAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const ComplianceAuditLog: Model<IComplianceAuditLog> =
  (mongoose.models.ComplianceAuditLog as Model<IComplianceAuditLog> | undefined) ??
  mongoose.model<IComplianceAuditLog>("ComplianceAuditLog", ComplianceAuditLogSchema);
