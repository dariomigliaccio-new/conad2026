"use client";
import { useEffect, useState } from "react";

// ── Types ────────────────────────────────────────────────

type Reg = {
  id: number; tipo: string; nome: string; sobrenome: string; email: string;
  dataNascimento: string; idade: number | null; sexo: string;
  rua: string; complemento: string; cidade: string; estado: string; zipcode: string;
  telefonePais: string; telefoneNumero: string;
  ministerio: string; congregacao: string; nomePastor: string;
  isMinistro: string; cargoMinisterio: string;
  temCargo: string; cargoLideranca: string;
  conjuge: string; filhos: string;
  comentarios: string; status: string; createdAt: string;
};

// ── SVG Charts ───────────────────────────────────────────

function BarChart({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="inscChartBox">
      <p className="inscChartTitle">{title}</p>
      <div className="inscBarList">
        {data.map(d => (
          <div key={d.label} className="inscBarRow">
            <span className="inscBarLabel">{d.label}</span>
            <div className="inscBarTrack">
              <div className="inscBarFill" style={{ width: `${(d.value / max) * 100}%`, background: d.color }} />
            </div>
            <span className="inscBarVal">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieChart({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const slices = data.map(d => {
    const pct = d.value / total;
    const start = cumulative;
    cumulative += pct;
    return { ...d, start, pct };
  });

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    if (endAngle - startAngle >= 1) return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    const a1 = startAngle * 2 * Math.PI - Math.PI / 2;
    const a2 = endAngle * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1); const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2); const y2 = cy + r * Math.sin(a2);
    const large = endAngle - startAngle > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="inscChartBox">
      <p className="inscChartTitle">{title}</p>
      <div className="inscPieWrap">
        <svg viewBox="0 0 120 120" width="120" height="120">
          {slices.map(s => (
            <path key={s.label} d={describeArc(60, 60, 54, s.start, s.start + s.pct)} fill={s.color} stroke="#fff" strokeWidth="1.5" />
          ))}
          {total === 0 && <circle cx="60" cy="60" r="54" fill="#e5e5e5" />}
        </svg>
        <ul className="inscPieLegend">
          {data.map(d => (
            <li key={d.label}>
              <span style={{ background: d.color }} />
              {d.label} <strong>({d.value})</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Edit Modal ───────────────────────────────────────────

function EditModal({ reg, onClose, onSaved }: { reg: Reg; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Reg>({ ...reg });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const f = (key: keyof Reg, val: string) => setForm(p => ({ ...p, [key]: val }));

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/inscricoes/${reg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if ((await res.json()).ok) { setMsg("Salvo!"); onSaved(); }
    else setMsg("Erro ao salvar.");
  }

  const inp = "inscModalInput";
  const sel = "inscModalInput inscModalSel";

  let conjugeData: { nome?: string; sobrenome?: string; dataNascimento?: string; idade?: number | null } = {};
  let filhosData: { nome?: string; sobrenome?: string; dataNascimento?: string; idade?: number | null }[] = [];
  try { conjugeData = form.conjuge !== "null" ? JSON.parse(form.conjuge) : {}; } catch { conjugeData = {}; }
  try { filhosData = JSON.parse(form.filhos) || []; } catch { filhosData = []; }

  return (
    <div className="inscModalOverlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="inscModal">
        <div className="inscModalHeader">
          <h2>Editar Inscrição #{String(reg.id).padStart(5, "0")}</h2>
          <button onClick={onClose} className="inscModalClose">✕</button>
        </div>

        <div className="inscModalBody">
          {msg && <p className="adminMsg">{msg}</p>}

          <div className="inscModalSection">
            <h3>Tipo e Status</h3>
            <div className="inscModalRow">
              <label>Tipo<select className={sel} value={form.tipo} onChange={e => f("tipo", e.target.value)}><option value="individual">Individual</option><option value="familiar">Familiar</option></select></label>
              <label>Status<select className={sel} value={form.status} onChange={e => f("status", e.target.value)}><option value="pendente">Pendente</option><option value="confirmado">Confirmado</option><option value="pago">Pago</option><option value="cancelado">Cancelado</option></select></label>
            </div>
          </div>

          <div className="inscModalSection">
            <h3>Dados Pessoais</h3>
            <div className="inscModalRow">
              <label>Nome<input className={inp} value={form.nome} onChange={e => f("nome", e.target.value)} /></label>
              <label>Sobrenome<input className={inp} value={form.sobrenome} onChange={e => f("sobrenome", e.target.value)} /></label>
            </div>
            <label>E-mail<input className={inp} value={form.email} onChange={e => f("email", e.target.value)} /></label>
            <div className="inscModalRow">
              <label>Data Nascimento<input className={inp} value={form.dataNascimento} onChange={e => f("dataNascimento", e.target.value)} /></label>
              <label>Sexo<select className={sel} value={form.sexo} onChange={e => f("sexo", e.target.value)}><option value="masculino">Masculino</option><option value="feminino">Feminino</option></select></label>
            </div>
          </div>

          <div className="inscModalSection">
            <h3>Endereço</h3>
            <label>Rua / Número<input className={inp} value={form.rua} onChange={e => f("rua", e.target.value)} /></label>
            <label>Complemento<input className={inp} value={form.complemento} onChange={e => f("complemento", e.target.value)} /></label>
            <div className="inscModalRow">
              <label>Cidade<input className={inp} value={form.cidade} onChange={e => f("cidade", e.target.value)} /></label>
              <label>Estado<input className={inp} value={form.estado} onChange={e => f("estado", e.target.value)} /></label>
              <label>ZIP<input className={inp} value={form.zipcode} onChange={e => f("zipcode", e.target.value)} /></label>
            </div>
          </div>

          <div className="inscModalSection">
            <h3>Contato</h3>
            <div className="inscModalRow">
              <label>País (código)<input className={inp} value={form.telefonePais} onChange={e => f("telefonePais", e.target.value)} /></label>
              <label>Telefone<input className={inp} value={form.telefoneNumero} onChange={e => f("telefoneNumero", e.target.value)} /></label>
            </div>
          </div>

          <div className="inscModalSection">
            <h3>Ministério</h3>
            <label>Ministério<input className={inp} value={form.ministerio} onChange={e => f("ministerio", e.target.value)} /></label>
            <label>Congregação<input className={inp} value={form.congregacao} onChange={e => f("congregacao", e.target.value)} /></label>
            <label>Nome do Pastor<input className={inp} value={form.nomePastor} onChange={e => f("nomePastor", e.target.value)} /></label>
            <div className="inscModalRow">
              <label>É Ministro?<select className={sel} value={form.isMinistro} onChange={e => f("isMinistro", e.target.value)}><option value="nao">Não</option><option value="sim">Sim</option></select></label>
              <label>Cargo Min.<input className={inp} value={form.cargoMinisterio} onChange={e => f("cargoMinisterio", e.target.value)} /></label>
            </div>
            <div className="inscModalRow">
              <label>Tem Cargo Liderança?<select className={sel} value={form.temCargo} onChange={e => f("temCargo", e.target.value)}><option value="nao">Não</option><option value="sim">Sim</option></select></label>
              <label>Cargo Liderança<input className={inp} value={form.cargoLideranca} onChange={e => f("cargoLideranca", e.target.value)} /></label>
            </div>
          </div>

          {conjugeData.nome && (
            <div className="inscModalSection">
              <h3>Cônjuge</h3>
              <p style={{ fontSize: 14, color: "#555" }}>
                {conjugeData.nome} {conjugeData.sobrenome} — {conjugeData.dataNascimento}
                {conjugeData.idade != null ? ` (${conjugeData.idade} anos)` : ""}
              </p>
            </div>
          )}

          {filhosData.length > 0 && (
            <div className="inscModalSection">
              <h3>Filhos ({filhosData.length})</h3>
              {filhosData.map((filho, i) => (
                <p key={i} style={{ fontSize: 14, color: "#555", margin: "4px 0" }}>
                  {i + 1}. {filho.nome} {filho.sobrenome} — {filho.dataNascimento}
                  {filho.idade != null ? ` (${filho.idade} anos)` : ""}
                </p>
              ))}
            </div>
          )}

          <div className="inscModalSection">
            <h3>Comentários (uso interno)</h3>
            <textarea
              className={inp}
              rows={4}
              style={{ resize: "vertical" }}
              value={form.comentarios}
              onChange={e => f("comentarios", e.target.value)}
              placeholder="Anotações sobre esta inscrição..."
            />
          </div>
        </div>

        <div className="inscModalFooter">
          <button onClick={onClose} className="adminButton" style={{ background: "#fff", color: "#333", border: "1px solid #ccc" }}>Cancelar</button>
          <button onClick={save} disabled={saving} className="adminButton">{saving ? "Salvando..." : "Salvar Alterações"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pendente: "#f59e0b", confirmado: "#3b82f6", pago: "#22c55e", cancelado: "#ef4444",
};

export default function AdminInscricoes() {
  const [regs, setRegs] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Reg | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/inscricoes");
    if (res.ok) setRegs(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta inscrição? Esta ação é irreversível.")) return;
    await fetch(`/api/inscricoes/${id}`, { method: "DELETE" });
    setRegs(r => r.filter(x => x.id !== id));
  }

  // CSV export
  function exportCsv() {
    const header = ["ID", "Tipo", "Nome", "Sobrenome", "Email", "Nasc.", "Idade", "Sexo", "Cidade", "Estado", "ZIP", "Telefone", "Ministério", "Congregação", "Pastor", "Ministro?", "Cargo Min.", "Cargo Lid.", "Status", "Data"];
    const rows = regs.map(r => [
      r.id, r.tipo, r.nome, r.sobrenome, r.email, r.dataNascimento, r.idade ?? "",
      r.sexo, r.cidade, r.estado, r.zipcode, `${r.telefonePais}${r.telefoneNumero}`,
      r.ministerio, r.congregacao, r.nomePastor, r.isMinistro, r.cargoMinisterio, r.cargoLideranca,
      r.status, r.createdAt,
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `inscricoes-conad2026-${Date.now()}.csv`; a.click();
  }

  // Derived stats
  const total = regs.length;
  const individuais = regs.filter(r => r.tipo === "individual").length;
  const familiares = regs.filter(r => r.tipo === "familiar").length;
  const masculinos = regs.filter(r => r.sexo === "masculino").length;
  const femininos = regs.filter(r => r.sexo === "feminino").length;
  const ministros = regs.filter(r => r.isMinistro === "sim").length;

  // Count filhos across all registrations
  let totalFilhos = 0;
  for (const r of regs) {
    try { const f = JSON.parse(r.filhos); if (Array.isArray(f)) totalFilhos += f.length; } catch { /* */ }
  }

  // Age groups (titulares + filhos)
  const ageGroups = { "0–12": 0, "13–17": 0, "18–25": 0, "26–35": 0, "36–50": 0, "51+": 0 };
  function addAge(age: number | null) {
    if (age === null) return;
    if (age <= 12) ageGroups["0–12"]++;
    else if (age <= 17) ageGroups["13–17"]++;
    else if (age <= 25) ageGroups["18–25"]++;
    else if (age <= 35) ageGroups["26–35"]++;
    else if (age <= 50) ageGroups["36–50"]++;
    else ageGroups["51+"]++;
  }
  for (const r of regs) {
    addAge(r.idade);
    try { const f = JSON.parse(r.filhos); if (Array.isArray(f)) f.forEach((c: { idade?: number }) => addAge(c.idade ?? null)); } catch { /* */ }
    try { const c = JSON.parse(r.conjuge); if (c?.idade != null) addAge(c.idade); } catch { /* */ }
  }

  // Ministry breakdown
  const ministerioCount: Record<string, number> = {};
  for (const r of regs) ministerioCount[r.ministerio] = (ministerioCount[r.ministerio] || 0) + 1;
  const ministerioData = Object.entries(ministerioCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], i) => ({
      label, value,
      color: ["#C98418", "#3b82f6", "#22c55e", "#ec4899", "#8b5cf6", "#f59e0b"][i] ?? "#999",
    }));

  const ACCENT_COLORS = ["#C98418", "#3b82f6", "#22c55e", "#ec4899", "#f59e0b", "#8b5cf6"];
  const ageData = Object.entries(ageGroups).map(([label, value], i) => ({
    label, value, color: ACCENT_COLORS[i] ?? "#999",
  }));

  // Filtered list
  const filtered = regs.filter(r => {
    const term = search.toLowerCase();
    const matchSearch = !term || `${r.nome} ${r.sobrenome} ${r.email} ${r.ministerio} ${r.congregacao}`.toLowerCase().includes(term);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="adminMain">
      {editing && (
        <EditModal reg={editing} onClose={() => setEditing(null)} onSaved={() => { load(); }} />
      )}

      {/* Header */}
      <div className="adminPanel" style={{ padding: "18px 20px" }}>
        <div className="adminPanelHeader" style={{ marginBottom: 0 }}>
          <div><p>MANAGER</p><h2>Inscrições</h2></div>
          <button className="adminButton" onClick={exportCsv}>↓ Exportar CSV</button>
        </div>
      </div>

      {/* Metrics */}
      <div className="adminMetricGrid">
        {[
          { label: "Total", value: total },
          { label: "Individuais", value: individuais },
          { label: "Familiares", value: familiares },
          { label: "Ministros", value: ministros },
          { label: "Masculino", value: masculinos },
          { label: "Feminino", value: femininos },
          { label: "Filhos", value: totalFilhos },
          { label: "Pendentes", value: regs.filter(r => r.status === "pendente").length },
        ].map(m => (
          <div key={m.label} className="adminMetric">
            <p>{m.label.toUpperCase()}</p>
            <strong>{m.value}</strong>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="inscChartsGrid">
        <BarChart title="Tipo de Inscrição" data={[{ label: "Individual", value: individuais, color: "#C98418" }, { label: "Familiar", value: familiares, color: "#3b82f6" }]} />
        <PieChart title="Sexo" data={[{ label: "Masculino", value: masculinos, color: "#3b82f6" }, { label: "Feminino", value: femininos, color: "#ec4899" }]} />
        <BarChart title="Faixa Etária" data={ageData} />
        <PieChart title="Ministérios" data={ministerioData} />
      </div>

      {/* List */}
      <div className="adminPanel">
        <div className="adminPanelHeader">
          <div><p>LISTA</p><h2>Todas as Inscrições</h2></div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              placeholder="Buscar nome, email, ministério..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "1px solid #d0d0d8", borderRadius: 8, padding: "8px 12px", fontSize: 13, minWidth: 220 }}
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ border: "1px solid #d0d0d8", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="confirmado">Confirmado</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#999", fontSize: 14, padding: "20px 0" }}>Carregando...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#999", fontSize: 14, padding: "20px 0" }}>Nenhuma inscrição encontrada.</p>
        ) : (
          <div className="inscRegTable">
            <div className="inscRegTableHead">
              <span>Nº</span><span>Nome</span><span>Tipo</span><span>Ministério</span>
              <span>Contato</span><span>Status</span><span>Data</span><span>Ações</span>
            </div>
            {filtered.map(r => (
              <div key={r.id} className="inscRegRow">
                <span className="inscRegId">#{String(r.id).padStart(5, "0")}</span>
                <span>
                  <strong style={{ display: "block", fontSize: 14 }}>{r.nome} {r.sobrenome}</strong>
                  <span style={{ fontSize: 12, color: "#888" }}>{r.email}</span>
                  {r.comentarios && <span title={r.comentarios} style={{ marginLeft: 6, cursor: "help", fontSize: 13 }}>💬</span>}
                </span>
                <span style={{ textTransform: "capitalize", fontSize: 13 }}>{r.tipo}</span>
                <span style={{ fontSize: 12, color: "#555" }}>
                  {r.ministerio}
                  {r.congregacao && <span style={{ display: "block", color: "#888" }}>{r.congregacao}</span>}
                </span>
                <span style={{ fontSize: 12 }}>
                  {r.telefonePais} {r.telefoneNumero}
                  <span style={{ display: "block", color: "#888" }}>{r.cidade}, {r.estado}</span>
                </span>
                <span>
                  <span className="inscStatusBadge" style={{ background: STATUS_COLORS[r.status] ?? "#999" }}>
                    {r.status}
                  </span>
                </span>
                <span style={{ fontSize: 12, color: "#888" }}>{r.createdAt.slice(0, 10)}</span>
                <span style={{ display: "flex", gap: 6 }}>
                  <button className="adminButton" style={{ fontSize: 12, minHeight: 32, padding: "0 10px", background: "#f4f4f8", color: "#333", border: "1px solid #ddd" }} onClick={() => setEditing(r)}>Editar</button>
                  <button className="adminButton" style={{ fontSize: 12, minHeight: 32, padding: "0 10px", background: "#fff0f0", color: "#c0392b", border: "1px solid #f0b8b8" }} onClick={() => handleDelete(r.id)}>Excluir</button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
