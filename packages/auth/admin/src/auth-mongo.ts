import type { Db, MongoClient } from "mongodb";
import mongoose from "mongoose";

export function getMongoDb(): Db {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB not connected — call dbConnect() before using auth");
  }
  return db;
}

export function getMongoClient(): MongoClient {
  return mongoose.connection.getClient();
}
