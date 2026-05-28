"use client";
import { useEffect, useState } from "react";
import { UploadInput } from "@/components/admin/UploadInput";

type Slide = {
  src: string;
  eyebrow: string;
  title: string;
  lead: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
};

const EMPTY_SLIDE: Slide = {
  src: "",
  eyebrow: "Conferência Nacional",
  title: "CONAD 2026",
  lead: "",
  primaryCta: "Inscreva-se agora",
  primaryHref: "#planos",
  secondaryCta: "Ver informações",
  secondaryHref: "#informacoes",
};

export default function AdminBannersPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [form, setForm] = useState<Slide>(EMPTY_SLIDE);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/content/hero")
      .then(r => r.json())
      .then(j => { if (Array.isArray(j?.slides)) setSlides(j.slides); });
  }, []);

  async function persist(next: Slide[]) {
    setSaving(true); setMsg("");
    try {
      const r = await fetch("/api/content/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: next }),
      });
      if (r.status === 401) { setMsg("✗ Não autorizado. Faça login novamente."); setSaving(false); return; }
      const j = await r.json();
      if (j?.github) setMsg("✓ Salvo e sincronizado com GitHub!");
      else if (j?.ok) setMsg("✓ Salvo! (configure GITHUB_TOKEN para persistir entre deploys)");
      else setMsg("✗ Erro ao salvar.");
    } catch { setMsg("✗ Erro de conexão."); }
    setSaving(false);
  }

  function deleteSlide(i: number) {
    const next = slides.filter((_, idx) => idx !== i);
    setSlides(next);
    persist(next);
  }

  function addSlide() {
    if (!form.src) { setMsg("✗ Adicione uma imagem antes de salvar."); return; }
    const next = [...slides, form];
    setSlides(next);
    setForm(EMPTY_SLIDE);
    persist(next);
  }

  const f = (k: keyof Slide) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <main className="adminMain">
      <section className="adminPanel">
        <div className="adminPanelHeader">
          <div><p>Home</p><h2>Banners do carrossel</h2></div>
        </div>
        {msg && <p className="adminMsg">{msg}</p>}

        <div className="bannerTable">
          {slides.length === 0 && <p style={{ padding: "16px", color: "var(--muted)" }}>Nenhum banner cadastrado.</p>}
          {slides.map((slide, i) => (
            <article className="bannerRow" key={i}>
              <div className="bannerThumb" style={{ position: "relative", width: 120, height: 70, flexShrink: 0, overflow: "hidden", borderRadius: 4, background: "#eee" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {slide.src && <img src={slide.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 14 }}>{slide.title}</h3>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{slide.eyebrow} · Ordem {i + 1}</p>
              </div>
              <div className="bannerActions">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => deleteSlide(i)}
                  style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 3, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                >
                  Deletar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="adminPanel adminFormPanel">
        <div className="adminPanelHeader">
          <div><p>Novo banner</p><h2>Adicionar ao carrossel</h2></div>
          <button className="adminButton" type="button" disabled={saving} onClick={addSlide}>
            {saving ? "Salvando..." : "Adicionar"}
          </button>
        </div>
        <div className="adminForm">
          <label>Imagem</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <input value={form.src} onChange={f("src")} placeholder="/images/hero1.jpg" style={{ flex: 1 }} />
            <UploadInput label="Upload" onUpload={url => setForm(p => ({ ...p, src: url }))} />
          </div>
          {form.src && (
            <div style={{ marginBottom: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.src} alt="" style={{ maxWidth: 240, height: 100, objectFit: "cover", borderRadius: 4 }} />
            </div>
          )}
          <label>Eyebrow (linha pequena acima)<input value={form.eyebrow} onChange={f("eyebrow")} /></label>
          <label>Título<input value={form.title} onChange={f("title")} /></label>
          <label>Texto<textarea value={form.lead} onChange={f("lead")} rows={3} /></label>
          <label>Botão primário texto<input value={form.primaryCta} onChange={f("primaryCta")} /></label>
          <label>Botão primário link<input value={form.primaryHref} onChange={f("primaryHref")} /></label>
          <label>Botão secundário texto<input value={form.secondaryCta} onChange={f("secondaryCta")} /></label>
          <label>Botão secundário link<input value={form.secondaryHref} onChange={f("secondaryHref")} /></label>
        </div>
      </section>
    </main>
  );
}
