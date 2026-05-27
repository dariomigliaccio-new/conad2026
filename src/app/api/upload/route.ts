import { promises as fs } from "fs";
import path from "path";

const GITHUB_REPO = process.env.GITHUB_REPO ?? "dariomigliaccio-new/conad2026";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = `${Date.now()}.${ext}`;

  // Save locally
  const uploadDir = path.join(process.cwd(), "data", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, safeName), buffer);

  // Commit to GitHub so image survives redeploys
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    const encoded = buffer.toString("base64");
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/data/uploads/${safeName}`;
    fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ message: `cms: upload ${safeName}`, content: encoded }),
    }).catch(err => console.error("[github] Failed to commit image:", err));
  }

  return Response.json({ url: `/api/image/${safeName}` });
}
