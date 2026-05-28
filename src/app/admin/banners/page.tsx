"use client";
import { useEffect, useState } from "react";
import { UploadInput } from "@/components/admin/UploadInput";
import type { HeroSlide } from "@/data/home";

const EMPTY: HeroSlide = {
  src: "", srcMobile: "",
  eyebrow: "Conferência Nacional", title: "CONAD 2026", lead: "",
  primaryCta: "Inscreva-se agora", primaryHref: "#planos",
  secondaryCta: "Ver informações", secondaryHref: "#informacoes",
};

export default function AdminBannersPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<HeroSlide>(EMPTY);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/content/hero").then(r => r.json())
      .then(j => { if (Array.isArray(j?.slides)) setSlides(j.slides); });
  }, []);

  async function persist(next: HeroSlide[]) {
    setSaving(true); setMsg("");
    try {
      const r = await fetch("/api/content/hero", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: next }),
      });
      if (r.status === 401) { setMsg("✗ Não autorizado."); setSaving(false); return; }
      const j = await r.json();
      setMsg(j?.github ? "✓ Salvo e sincronizado!" : j?.ok ? "✓ Salvo!" : "✗ Erro ao salvar.");
    } catch { setMsg("✗ Erro de conexão."); }
    setSaving(false);
  }

  function startEdit(i: number) { setEditing(i); setForm({ ...slides[i] }); setAdding(false); }
  function cancelEdit() { setEditing(null); setAdding(false); setForm(EMPTY); }

  function saveEdit() {
    const next = editing !== null
      ? slides.map((s, i) => i === editing ? form : s)
      : [...slides, form];
    setSlides(next);
    persist(next);
    cancelEdit();
  }

  function deleteSlide(i: number) {
    if (!confirm("Deletar este banner?")) return;
    const next = slides.filter((_, idx) => idx !== i);
    setSlides(next);
    persist(next);
  }

  const f = (k: keyof HeroSlide) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const isOpen = editing !== null || adding;

  return (
    <main className="adminMain">
      <section className="adminPanel">
        <div className="adminPanelHeader">
          <div><p>Home</p><h2>Banners do carrossel</h2></div>
          <button className="adminButton" type="button" onClick={() => { setAdding(true); setEditing(null); setForm(EMPTY); }}>
            + Novo banner
          </button>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}

        <div className="bannerTable">
          {slides.length === 0 && <p style={{ padding: 16, color: "#888" }}>Nenhum banner cadastrado.</p>}
          {slides.map((slide, i) => (
            <article className="bannerRow" key={i}>
              <div style={{ width: 120, height: 70, flexShrink: 0, overflow: "hidden", borderRadius: 4, background: "#eee", position: "relative" }}>
                {slide.src && <img src={slide.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 14 }}>{slide.title || "Sem título"}</h3>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                  Ordem {i + 1}
                  {slide.srcMobile && <span style={{ marginLeft: 8, color: "#4caf50" }}>● mobile</span>}
                </p>
              </div>
              <div className="bannerActions" style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => startEdit(i)}
                  style={{ background: "#1C0E04", color: "#fff", border: "none", borderRadius: 3, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  Editar
                </button>
                <button type="button" disabled={saving} onClick={() => deleteSlide(i)}
                  style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 3, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                  Deletar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {isOpen && (
        <section className="adminPanel adminFormPanel">
          <div className="adminPanelHeader">
            <div><p>{editing !== null ? `Editando banner ${editing + 1}` : "Novo banner"}</p><h2>Campos do banner</h2></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="adminButton" type="button" disabled={saving} onClick={saveEdit}>
                {saving ? "Salvando..." : editing !== null ? "Salvar edição" : "Adicionar"}
              </button>
              <button type="button" onClick={cancelEdit}
                style={{ background: "none", border: "1px solid #ccc", borderRadius: 3, padding: "6px 14px", cursor: "pointer", fontSize: 12 }}>
                Cancelar
              </button>
            </div>
          </div>

          <div className="adminForm">
            <label>Imagem desktop</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input value={form.src} onChange={f("src")} placeholder="/images/hero1.jpg" style={{ flex: 1 }} />
              <UploadInput label="Upload" onUpload={url => setForm(p => ({ ...p, src: url }))} />
            </div>
            {form.src && <img src={form.src} alt="" style={{ maxWidth: 280, height: 120, objectFit: "cover", borderRadius: 4, marginBottom: 16 }} />}

            <label>Imagem mobile <small style={{ color: "#888", fontWeight: 400 }}>(800×1000px recomendado)</small></label>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input value={form.srcMobile ?? ""} onChange={f("srcMobile")} placeholder="/images/hero1-mobile.jpg" style={{ flex: 1 }} />
              <UploadInput label="Upload" onUpload={url => setForm(p => ({ ...p, srcMobile: url }))} />
            </div>
            {form.srcMobile && <img src={form.srcMobile} alt="" style={{ maxWidth: 140, height: 175, objectFit: "cover", borderRadius: 4, marginBottom: 16 }} />}

            <label>Eyebrow (texto pequeno acima do título)<input value={form.eyebrow} onChange={f("eyebrow")} /></label>
            <label>Título<input value={form.title} onChange={f("title")} /></label>
            <label>Texto descritivo<textarea value={form.lead} onChange={f("lead")} rows={3} /></label>
            <label>Botão primário — texto<input value={form.primaryCta} onChange={f("primaryCta")} /></label>
            <label>Botão primário — link<input value={form.primaryHref} onChange={f("primaryHref")} /></label>
            <label>Botão secundário — texto<input value={form.secondaryCta} onChange={f("secondaryCta")} /></label>
            <label>Botão secundário — link<input value={form.secondaryHref} onChange={f("secondaryHref")} /></label>
          </div>
        </section>
      )}
    </main>
  );
}
