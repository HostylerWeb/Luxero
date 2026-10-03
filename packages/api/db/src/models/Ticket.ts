import { type Document } from "mongoose";
import { m } from "../db";
import { createTicketSchema, type ITicketFields } from "./schemas/ticket.schema";

export type { TicketStatus } from "./schemas/ticket.schema";
export type ITicket = ITicketFields & Document;

const TicketSchema = createTicketSchema();

export const Ticket = m("Ticket", TicketSchema);
