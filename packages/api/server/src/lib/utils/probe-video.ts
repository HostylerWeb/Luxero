import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface ProbeResult {
  width: number;
  height: number;
  fps: number;
  duration: number;
  codec: string;
  size: number;
}

export async function probeVideo(videoPath: string): Promise<ProbeResult> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    videoPath,
  ]);

  const data = JSON.parse(stdout);

  const videoStream = data.streams?.find((s: { codec_type: string }) => s.codec_type === "video");
  if (!videoStream) {
    throw new Error("No video stream found in probe output");
  }

  const fps = parseFps(videoStream.r_frame_rate ?? "");
  const size = parseInt(data.format?.size ?? "0", 10);

  return {
    width: videoStream.width ?? 0,
    height: videoStream.height ?? 0,
    fps,
    duration: parseFloat(data.format?.duration ?? videoStream.duration ?? "0"),
    codec: videoStream.codec_name ?? "unknown",
    size: Number.isNaN(size) ? 0 : size,
  };
}

function parseFps(rFrameRate: string): number {
  if (!rFrameRate) return 0;
  const parts = rFrameRate.split("/");
  if (parts.length !== 2) return parseFloat(rFrameRate) || 0;
  const num = parseFloat(parts[0] ?? "");
  const den = parseFloat(parts[1] ?? "");
  if (!den) return num;
  return num / den;
}
