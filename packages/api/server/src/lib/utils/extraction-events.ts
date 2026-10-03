import { EventEmitter } from "node:events";

type ExtractionEvent =
  | { type: "progress"; framesExtracted: number; framesTotal?: number; percentage: number }
  | { type: "completed"; prefix: string; count: number }
  | { type: "failed"; error: string };

const bus = new EventEmitter();
bus.setMaxListeners(200);

export function emitProgress(jobId: string, data: ExtractionEvent): void {
  bus.emit(jobId, data);
}

export function onProgress(jobId: string, cb: (data: ExtractionEvent) => void): () => void {
  bus.on(jobId, cb);
  return () => {
    bus.off(jobId, cb);
  };
}
