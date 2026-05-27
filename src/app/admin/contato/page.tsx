"use client";
import { useEffect, useState } from "react";

type Contato = { email: string; whatsapp: string; horario: string; intro: string };
const EMPTY: Contato = { email: "", whatsapp: "", horario: "", intro: "" };

export default function AdminContato() {
  const [d, setD] = useState<Contato>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetch("/api/content/contato").then(r => r.json()).then(setD); }, []);

  async function save() {
    setSaving(true); setMsg("");
    const r = await fetch("/api/content/contato", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    r.json().then(j => setMsg(j?.github ? "✓ Salvo e sincronizado com GitHub!" : j?.ok ? "✓ Salvo! ⚠ Token GitHub inválido." : "✗ Erro ao salvar."));
    setSaving(false);
  }

  const f = (k: keyof Contato) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="adminMain">
      <div className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div><p>MANAGER</p><h2>Contato</h2></div>
          <button className="adminButton" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}
        <div className="adminForm">
          <label>Texto de introdução<textarea rows={3} value={d.intro} onChange={f("intro")} /></label>
          <label>E-mail<input type="email" value={d.email} onChange={f("email")} /></label>
          <label>WhatsApp (com código do país)<input value={d.whatsapp} onChange={f("whatsapp")} placeholder="+55 11 99999-9999" /></label>
          <label>Horário de atendimento<input value={d.horario} onChange={f("horario")} placeholder="Segunda a Sexta, 9h–18h" /></label>
        </div>
      </div>
    </div>
  );
}
