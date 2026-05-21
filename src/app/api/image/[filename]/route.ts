import { promises as fs } from "fs";
import path from "path";

const MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
};

export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  // Reject any path traversal attempts
  const safe = path.basename(filename);
  const filePath = path.join(process.cwd(), "data", "uploads", safe);

  try {
    const buf = await fs.readFile(filePath);
    const ext = safe.split(".").pop()?.toLowerCase() ?? "jpg";
    const mime = MIME[ext] ?? "application/octet-stream";
    return new Response(buf, { headers: { "Content-Type": mime, "Cache-Control": "public, max-age=31536000" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
