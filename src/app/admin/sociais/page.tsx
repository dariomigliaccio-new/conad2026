"use client";
import { useEffect, useState } from "react";

type Sociais = { instagram: string; facebook: string; youtube: string; whatsapp: string };
const EMPTY: Sociais = { instagram: "", facebook: "", youtube: "", whatsapp: "" };

export default function AdminSociais() {
  const [d, setD] = useState<Sociais>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetch("/api/content/sociais").then(r => r.json()).then(setD); }, []);

  async function save() {
    setSaving(true); setMsg("");
    const r = await fetch("/api/content/sociais", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    r.json().then(j => setMsg(j?.github ? "✓ Salvo e sincronizado com GitHub!" : j?.ok ? "✓ Salvo! ⚠ Token GitHub inválido." : "✗ Erro ao salvar."));
    setSaving(false);
  }

  const f = (k: keyof Sociais) => (e: React.ChangeEvent<HTMLInputElement>) => setD(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="adminMain">
      <div className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div><p>MANAGER</p><h2>Redes Sociais</h2></div>
          <button className="adminButton" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}
        <div className="adminForm">
          <label>Instagram (URL completa)<input value={d.instagram} onChange={f("instagram")} placeholder="https://instagram.com/..." /></label>
          <label>Facebook (URL completa)<input value={d.facebook} onChange={f("facebook")} placeholder="https://facebook.com/..." /></label>
          <label>YouTube (URL completa)<input value={d.youtube} onChange={f("youtube")} placeholder="https://youtube.com/..." /></label>
          <label>WhatsApp (URL completa)<input value={d.whatsapp} onChange={f("whatsapp")} placeholder="https://wa.me/55..." /></label>
        </div>
      </div>
    </div>
  );
}
