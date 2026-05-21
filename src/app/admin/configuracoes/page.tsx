"use client";
import { useEffect, useState } from "react";
import { UploadInput } from "@/components/admin/UploadInput";

type Global = { logo: string; logoAlt: string };
const EMPTY: Global = { logo: "", logoAlt: "CONAD 2026" };

export default function AdminConfiguracoes() {
  const [d, setD] = useState<Global>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetch("/api/content/global").then(r => r.json()).then(setD); }, []);

  async function save() {
    setSaving(true); setMsg("");
    const r = await fetch("/api/content/global", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    r.json().then(j => setMsg(j?.github ? "✓ Salvo e sincronizado com GitHub!" : j?.ok ? "✓ Salvo! ⚠ Token GitHub inválido." : "✗ Erro ao salvar."));
    setSaving(false);
  }

  const f = (k: keyof Global) => (e: React.ChangeEvent<HTMLInputElement>) => setD(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="adminMain">
      <div className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div><p>MANAGER</p><h2>Configurações Globais</h2></div>
          <button className="adminButton" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}
        <div className="adminForm">
          <label>URL do Logo</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <input value={d.logo} onChange={f("logo")} placeholder="/images/conad-logo.png" style={{ flex: 1 }} />
            <UploadInput label="Upload logo" onUpload={url => setD(p => ({ ...p, logo: url }))} />
          </div>
          {d.logo && (
            <div style={{ background: "#f4f4f4", padding: 20, display: "inline-block", borderRadius: 6, marginBottom: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.logo} alt={d.logoAlt} style={{ maxWidth: 200, maxHeight: 70, objectFit: "contain", display: "block" }} />
            </div>
          )}
          <label>Texto alternativo do logo<input value={d.logoAlt} onChange={f("logoAlt")} /></label>
          <div style={{ background: "#f8f8f0", border: "1px solid #e0d890", borderRadius: 6, padding: "14px 16px" }}>
            <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 13 }}>Token do Mapbox</p>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
              O token do Mapbox é configurado como variável de ambiente no Railway para não expor em código.<br />
              <strong>No Railway:</strong> Seu projeto → Variables → adicione <code>MAPBOX_TOKEN</code> com o valor do seu token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
