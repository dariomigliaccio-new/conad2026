"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

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
    setMsg(r.ok ? "✓ Salvo com sucesso!" : "✗ Erro ao salvar.");
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
          <label>
            URL do Logo (caminho da imagem)
            <input value={d.logo} onChange={f("logo")} placeholder="/images/conad-logo.png" />
          </label>
          <label>
            Texto alternativo do logo (acessibilidade)
            <input value={d.logoAlt} onChange={f("logoAlt")} />
          </label>
          {d.logo && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Pré-visualização:</p>
              <div style={{ background: "#f4f4f4", padding: 20, display: "inline-block", borderRadius: 6 }}>
                <Image src={d.logo} width={200} height={70} alt={d.logoAlt} style={{ objectFit: "contain", height: "auto" }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
