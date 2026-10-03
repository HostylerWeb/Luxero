import mongoose from "mongoose";

type CloseableServer = {
  close(callback?: (err?: Error) => void): void;
};

export function closeHttpServer(server: CloseableServer): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

export async function closeMongoConnection(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

export async function shutdownApiResources(options: {
  server?: CloseableServer;
  closeMongo?: boolean;
}): Promise<void> {
  if (options.server) {
    await closeHttpServer(options.server);
    console.log("HTTP server closed");
  }

  if (options.closeMongo) {
    await closeMongoConnection();
  }
}
