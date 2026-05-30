"use client";
import { useEffect, useState } from "react";

type Evento = { titulo: string; subtitulo: string; descricao: string; data: string; cidade: string; youtube_url: string };
const EMPTY: Evento = { titulo: "", subtitulo: "", descricao: "", data: "", cidade: "", youtube_url: "" };

export default function AdminEvento() {
  const [d, setD] = useState<Evento>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetch("/api/content/evento").then(r => r.json()).then(setD); }, []);

  async function save() {
    setSaving(true); setMsg("");
    const r = await fetch("/api/content/evento", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    r.json().then(j => setMsg(j?.github ? "✓ Salvo e sincronizado com GitHub!" : j?.ok ? "✓ Salvo! ⚠ Token GitHub inválido." : "✗ Erro ao salvar."));
    setSaving(false);
  }

  const f = (k: keyof Evento) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="adminMain">
      <div className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div><p>MANAGER</p><h2>O Evento</h2></div>
          <button className="adminButton" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}
        <div className="adminForm">
          <label>Título principal<input value={d.titulo} onChange={f("titulo")} /></label>
          <label>Subtítulo / Tagline<input value={d.subtitulo} onChange={f("subtitulo")} /></label>
          <label>
            Link do YouTube (cole a URL do vídeo)
            <input
              value={d.youtube_url}
              onChange={f("youtube_url")}
              placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
            />
          </label>
          {d.youtube_url && (
            <p style={{ fontSize: 12, color: "#888", margin: "-8px 0 0" }}>
              O vídeo aparecerá automaticamente na página O Evento.
            </p>
          )}
          <label>Data do evento (ex: 3-6 de Dezembro, 2026)<input value={d.data} onChange={f("data")} /></label>
          <label>Cidade / Local resumido<input value={d.cidade} onChange={f("cidade")} /></label>
          <label>Descrição (não exibida no site, apenas referência)<textarea rows={4} value={d.descricao} onChange={f("descricao")} /></label>
        </div>
      </div>
    </div>
  );
}
