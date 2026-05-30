import { promises as fs } from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "data", "registrations.json");

export type Registration = {
  id: number;
  tipo: string;
  nome: string; sobrenome: string; email: string;
  dataNascimento: string; idade: number | null; sexo: string;
  pais: string;
  rua: string; complemento: string; cidade: string; estado: string; zipcode: string;
  telefonePais: string; telefoneNumero: string;
  ministerio: string; congregacao: string; nomePastor: string;
  isMinistro: string; cargoMinisterio: string;
  temCargo: string; cargoLideranca: string;
  conjuge: string; filhos: string;
  comentarios: string; status: string;
  createdAt: string; updatedAt: string;
};

async function readAll(): Promise<Registration[]> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(raw) as Registration[];
  } catch {
    return [];
  }
}

async function writeAll(regs: Registration[]): Promise<void> {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(regs, null, 2), "utf-8");
}

export async function listRegistrations(): Promise<Registration[]> {
  const all = await readAll();
  return all.slice().reverse();
}

export async function getRegistration(id: number): Promise<Registration | undefined> {
  const all = await readAll();
  return all.find(r => r.id === id);
}

export class DuplicateError extends Error {
  constructor(public field: "email" | "telefone") {
    super(field === "email" ? "Este e-mail já possui uma inscrição." : "Este telefone já possui uma inscrição.");
  }
}

export async function createRegistration(
  data: Omit<Registration, "id" | "createdAt" | "updatedAt" | "comentarios" | "status">
): Promise<number> {
  const all = await readAll();
  if (all.some(r => r.email.toLowerCase() === data.email.toLowerCase())) throw new DuplicateError("email");
  if (all.some(r => r.telefonePais === data.telefonePais && r.telefoneNumero === data.telefoneNumero)) throw new DuplicateError("telefone");
  const id = all.length > 0 ? Math.max(...all.map(r => r.id)) + 1 : 1;
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const reg: Registration = {
    ...data,
    id,
    comentarios: "",
    status: "pendente",
    createdAt: now,
    updatedAt: now,
  };
  all.push(reg);
  await writeAll(all);
  return id;
}

export async function updateRegistration(
  id: number,
  data: Partial<Omit<Registration, "id" | "createdAt">>
): Promise<void> {
  const all = await readAll();
  const idx = all.findIndex(r => r.id === id);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    ...data,
    updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
  };
  await writeAll(all);
}

export async function deleteRegistration(id: number): Promise<void> {
  const all = await readAll();
  await writeAll(all.filter(r => r.id !== id));
}
