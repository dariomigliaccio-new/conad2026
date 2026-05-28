import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "registrations.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      nome TEXT NOT NULL,
      sobrenome TEXT NOT NULL,
      email TEXT NOT NULL,
      dataNascimento TEXT NOT NULL,
      idade INTEGER,
      sexo TEXT NOT NULL,
      rua TEXT NOT NULL,
      complemento TEXT DEFAULT '',
      cidade TEXT NOT NULL,
      estado TEXT NOT NULL,
      zipcode TEXT NOT NULL,
      telefonePais TEXT NOT NULL,
      telefoneNumero TEXT NOT NULL,
      ministerio TEXT NOT NULL,
      congregacao TEXT DEFAULT '',
      nomePastor TEXT NOT NULL,
      isMinistro TEXT NOT NULL,
      cargoMinisterio TEXT DEFAULT '',
      temCargo TEXT NOT NULL,
      cargoLideranca TEXT DEFAULT '',
      conjuge TEXT DEFAULT 'null',
      filhos TEXT DEFAULT '[]',
      comentarios TEXT DEFAULT '',
      status TEXT DEFAULT 'pendente',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );
  `);
  return _db;
}

export type Registration = {
  id: number;
  tipo: "individual" | "familiar";
  nome: string;
  sobrenome: string;
  email: string;
  dataNascimento: string;
  idade: number | null;
  sexo: string;
  rua: string;
  complemento: string;
  cidade: string;
  estado: string;
  zipcode: string;
  telefonePais: string;
  telefoneNumero: string;
  ministerio: string;
  congregacao: string;
  nomePastor: string;
  isMinistro: string;
  cargoMinisterio: string;
  temCargo: string;
  cargoLideranca: string;
  conjuge: string;
  filhos: string;
  comentarios: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export function listRegistrations(): Registration[] {
  return getDb()
    .prepare("SELECT * FROM registrations ORDER BY createdAt DESC")
    .all() as Registration[];
}

export function getRegistration(id: number): Registration | undefined {
  return getDb()
    .prepare("SELECT * FROM registrations WHERE id = ?")
    .get(id) as Registration | undefined;
}

export function createRegistration(data: Omit<Registration, "id" | "createdAt" | "updatedAt" | "comentarios" | "status">): number {
  const stmt = getDb().prepare(`
    INSERT INTO registrations
      (tipo, nome, sobrenome, email, dataNascimento, idade, sexo,
       rua, complemento, cidade, estado, zipcode,
       telefonePais, telefoneNumero,
       ministerio, congregacao, nomePastor,
       isMinistro, cargoMinisterio, temCargo, cargoLideranca,
       conjuge, filhos)
    VALUES
      (@tipo, @nome, @sobrenome, @email, @dataNascimento, @idade, @sexo,
       @rua, @complemento, @cidade, @estado, @zipcode,
       @telefonePais, @telefoneNumero,
       @ministerio, @congregacao, @nomePastor,
       @isMinistro, @cargoMinisterio, @temCargo, @cargoLideranca,
       @conjuge, @filhos)
  `);
  const result = stmt.run(data);
  return result.lastInsertRowid as number;
}

export function updateRegistration(id: number, data: Partial<Omit<Registration, "id" | "createdAt">>): void {
  const fields = Object.keys(data)
    .map(k => `${k} = @${k}`)
    .join(", ");
  getDb()
    .prepare(`UPDATE registrations SET ${fields}, updatedAt = datetime('now') WHERE id = @id`)
    .run({ ...data, id });
}

export function deleteRegistration(id: number): void {
  getDb().prepare("DELETE FROM registrations WHERE id = ?").run(id);
}
