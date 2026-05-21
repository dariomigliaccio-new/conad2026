"use client";
import { useEffect, useState } from "react";

type Local = { nome: string; endereco: string; cidade: string; estado: string; cep: string; descricao: string; lat: string; lng: string; como_chegar: string; hospedagem: string };
const EMPTY: Local = { nome: "", endereco: "", cidade: "", estado: "", cep: "", descricao: "", lat: "", lng: "", como_chegar: "", hospedagem: "" };

export default function AdminLocal() {
  const [d, setD] = useState<Local>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetch("/api/content/local").then(r => r.json()).then(setD); }, []);

  async function save() {
    setSaving(true); setMsg("");
    const r = await fetch("/api/content/local", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    r.json().then(j => setMsg(j?.github ? "✓ Salvo e sincronizado com GitHub!" : j?.ok ? "✓ Salvo! ⚠ Token GitHub inválido." : "✗ Erro ao salvar."));
    setSaving(false);
  }

  const f = (k: keyof Local) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="adminMain">
      <div className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div><p>MANAGER</p><h2>Local do Evento</h2></div>
          <button className="adminButton" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}
        <div className="adminForm">
          <label>Nome do local<input value={d.nome} onChange={f("nome")} /></label>
          <label>Endereço completo<input value={d.endereco} onChange={f("endereco")} /></label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px", gap: 12 }}>
            <label>Cidade<input value={d.cidade} onChange={f("cidade")} /></label>
            <label>Estado<input value={d.estado} onChange={f("estado")} /></label>
            <label>CEP<input value={d.cep} onChange={f("cep")} /></label>
          </div>
          <label>Descrição<textarea rows={3} value={d.descricao} onChange={f("descricao")} /></label>

          <div style={{ borderTop: "1px solid #e0e0e6", paddingTop: 16, marginTop: 4 }}>
            <p style={{ fontWeight: 700, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "#888", marginBottom: 8 }}>Coordenadas para o Mapa</p>
            <div style={{ background: "#fffbe6", border: "1px solid #f0e060", borderRadius: 6, padding: "10px 14px", marginBottom: 14, fontSize: 13 }}>
              <strong>Como obter as coordenadas:</strong><br />
              1. Acesse <strong>maps.google.com</strong><br />
              2. Pesquise o endereço do evento<br />
              3. Clique com botão direito no local exato → <em>&#34;O que há aqui?&#34;</em><br />
              4. Copie os números que aparecem (ex: -15.7797, -47.9297).<br />
              O primeiro é a <strong>latitude</strong>, o segundo é a <strong>longitude</strong>.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label>Latitude (ex: -15.7797)<input value={d.lat} onChange={f("lat")} placeholder="-15.7797" /></label>
              <label>Longitude (ex: -47.9297)<input value={d.lng} onChange={f("lng")} placeholder="-47.9297" /></label>
            </div>
            {d.lat && d.lng && (
              <a
                href={`https://www.google.com/maps?q=${d.lat},${d.lng}`}
                target="_blank"
                rel="noopener"
                style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: "#1976D2", textDecoration: "underline" }}
              >
                Verificar no Google Maps ↗
              </a>
            )}
          </div>

          <label>Como chegar<textarea rows={4} value={d.como_chegar} onChange={f("como_chegar")} /></label>
          <label>Hospedagem<textarea rows={4} value={d.hospedagem} onChange={f("hospedagem")} /></label>
        </div>
      </div>
    </div>
  );
}
