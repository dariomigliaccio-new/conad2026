import { type NextRequest } from "next/server";
import { createRegistration, listRegistrations, DuplicateError } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";

function isAdmin(req: NextRequest): boolean {
  const cookie = req.headers.get("cookie") ?? "";
  const token = cookie.split(";").find(c => c.trim().startsWith("admin_auth="))?.split("=")[1]?.trim();
  return Boolean(token && process.env.AUTH_SECRET && token === process.env.AUTH_SECRET);
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return Response.json({ error: "Não autorizado" }, { status: 401 });
  return Response.json(await listRegistrations());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = await createRegistration({
      tipo: body.tipo,
      nome: body.nome,
      sobrenome: body.sobrenome,
      email: body.email,
      dataNascimento: body.dataNascimento,
      idade: body.idade ?? null,
      sexo: body.sexo,
      rua: body.rua,
      complemento: body.complemento ?? "",
      cidade: body.cidade,
      estado: body.estado,
      zipcode: body.zipcode,
      telefonePais: body.telefonePais,
      telefoneNumero: body.telefoneNumero,
      ministerio: body.ministerio,
      congregacao: body.congregacao ?? "",
      nomePastor: body.nomePastor,
      isMinistro: body.isMinistro,
      cargoMinisterio: body.cargoMinisterio ?? "",
      temCargo: body.temCargo,
      cargoLideranca: body.cargoLideranca ?? "",
      conjuge: body.conjuge ? JSON.stringify(body.conjuge) : "null",
      filhos: JSON.stringify(body.filhos ?? []),
    });
    await sendConfirmationEmail(body.email, body.nome, id);
    return Response.json({ ok: true, id });
  } catch (err) {
    if (err instanceof DuplicateError)
      return Response.json({ error: err.message, field: err.field }, { status: 409 });
    console.error("[inscricoes] POST error:", err);
    return Response.json({ error: "Erro ao salvar inscrição" }, { status: 500 });
  }
}
