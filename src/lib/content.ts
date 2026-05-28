import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DEFAULTS_DIR = path.join(process.cwd(), "data-defaults");
const GITHUB_REPO = process.env.GITHUB_REPO ?? "dariomigliaccio-new/conad2026";

export async function readContent<T>(section: string): Promise<T> {
  // Try data/ first, then fall back to data-defaults/
  for (const dir of [DATA_DIR, DEFAULTS_DIR]) {
    try {
      const raw = await fs.readFile(path.join(dir, `${section}.json`), "utf-8");
      return JSON.parse(raw) as T;
    } catch {}
  }
  throw new Error(`Content not found: ${section}`);
}

export async function writeContent(section: string, data: unknown): Promise<{ github: boolean }> {
  const json = JSON.stringify(data, null, 2);
  const file = path.join(DATA_DIR, `${section}.json`);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(file, json, "utf-8");
  // Persist to GitHub so redeploys never lose data
  try {
    await commitToGitHub(section, json);
    return { github: true };
  } catch (err) {
    console.error(`[github] Failed to commit ${section}:`, err);
    return { github: false };
  }
}

async function commitToGitHub(section: string, json: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return;
  const encoded = Buffer.from(json).toString("base64");
  await Promise.all([
    pushFile(token, `data/${section}.json`, encoded),
    pushFile(token, `data-defaults/${section}.json`, encoded),
  ]);
}

async function pushFile(token: string, filePath: string, encoded: string): Promise<void> {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const getRes = await fetch(url, { headers });
  const sha: string | undefined = getRes.ok ? (await getRes.json()).sha : undefined;
  const putRes = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify({ message: `cms: update ${filePath}`, content: encoded, ...(sha ? { sha } : {}) }),
  });
  if (!putRes.ok) {
    const body = await putRes.text();
    throw new Error(`GitHub PUT ${filePath} → ${putRes.status}: ${body}`);
  }
}
