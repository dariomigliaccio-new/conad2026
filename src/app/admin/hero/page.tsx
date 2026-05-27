"use client";
import { useEffect, useState } from "react";

type Slide = { src: string; eyebrow: string; title: string; lead: string; primaryCta: string; primaryHref: string; secondaryCta: string; secondaryHref: string };
type Data = { slides: Slide[] };
const newSlide = (): Slide => ({ src: "", eyebrow: "Conferência Nacional", title: "CONAD 2026", lead: "", primaryCta: "Inscreva-se agora", primaryHref: "#planos", secondaryCta: "Ver informações", secondaryHref: "#informacoes" });

export default function AdminHero() {
  const [d, setD] = useState<Data>({ slides: [] });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetch("/api/content/hero").then(r => r.json()).then(setD); }, []);

  async function save() {
    setSaving(true); setMsg("");
    const r = await fetch("/api/content/hero", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    r.json().then(j => setMsg(j?.github ? "✓ Salvo e sincronizado com GitHub!" : j?.ok ? "✓ Salvo! ⚠ Token GitHub inválido." : "✗ Erro ao salvar."));
    setSaving(false);
  }

  function update(i: number, k: keyof Slide, v: string) {
    setD(p => { const slides = [...p.slides]; slides[i] = { ...slides[i], [k]: v }; return { slides }; });
  }

  function remove(i: number) { setD(p => ({ slides: p.slides.filter((_, j) => j !== i) })); }

  return (
    <div className="adminMain">
      <div className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div><p>MANAGER</p><h2>Carrossel / Hero</h2></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="adminButton" style={{ background: "#fff", color: "#000", border: "1px solid #ccc" }} onClick={() => setD(p => ({ slides: [...p.slides, newSlide()] }))}>+ Slide</button>
            <button className="adminButton" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}

        {d.slides.map((s, i) => (
          <div key={i} className="adminListItem">
            <div className="adminListItemHeader">
              <strong>Slide {i + 1}{s.src && ` — ${s.src}`}</strong>
              <button className="adminRemoveBtn" onClick={() => remove(i)}>Remover</button>
            </div>
            <div className="adminForm">
              <label>Imagem (caminho, ex: /images/hero1.jpg)<input value={s.src} onChange={e => update(i, "src", e.target.value)} /></label>
              <label>Eyebrow (texto pequeno acima)<input value={s.eyebrow} onChange={e => update(i, "eyebrow", e.target.value)} /></label>
              <label>Título<input value={s.title} onChange={e => update(i, "title", e.target.value)} /></label>
              <label>Lead (descrição)<textarea rows={2} value={s.lead} onChange={e => update(i, "lead", e.target.value)} /></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label>Botão primário — Texto<input value={s.primaryCta} onChange={e => update(i, "primaryCta", e.target.value)} /></label>
                <label>Botão primário — Link<input value={s.primaryHref} onChange={e => update(i, "primaryHref", e.target.value)} /></label>
                <label>Botão secundário — Texto<input value={s.secondaryCta} onChange={e => update(i, "secondaryCta", e.target.value)} /></label>
                <label>Botão secundário — Link<input value={s.secondaryHref} onChange={e => update(i, "secondaryHref", e.target.value)} /></label>
              </div>
            </div>
          </div>
        ))}

        {d.slides.length === 0 && <p style={{ color: "#888", padding: "24px 0" }}>Nenhum slide. Clique em "+ Slide".</p>}
      </div>
    </div>
  );
}
