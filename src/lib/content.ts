import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function readContent<T>(section: string): Promise<T> {
  const file = path.join(DATA_DIR, `${section}.json`);
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as T;
}

export async function writeContent(section: string, data: unknown): Promise<void> {
  const file = path.join(DATA_DIR, `${section}.json`);
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}
