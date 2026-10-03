import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export interface IOrderItem extends Document, ISoftDelete {
  orderId: mongoose.Types.ObjectId;
  competitionId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ticketNumbers?: number[];
  answerIndex?: number;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    ticketNumbers: [{ type: Number }],
    answerIndex: { type: Number },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

OrderItemSchema.index({ orderId: 1 });
OrderItemSchema.index({ competitionId: 1 });
OrderItemSchema.index({ orderId: 1, competitionId: 1 });

OrderItemSchema.plugin(softDeletePlugin);

export const OrderItem = m<IOrderItem>("OrderItem", OrderItemSchema) as SoftDeleteModel<IOrderItem>;
