import { MongoMemoryServer } from "mongodb-memory-server";

export async function setup() {
  const server = await MongoMemoryServer.create();
  const uri = server.getUri();
  process.env.DATABASE_URL = uri;
  process.env.NODE_ENV = "test";
  return async () => {
    await server.stop();
  };
}
