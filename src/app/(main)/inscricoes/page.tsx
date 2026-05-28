"use client";
import { useState, useCallback } from "react";
import {
  MINISTERIOS,
  CONGREGACOES_BELEM,
  US_STATES,
  COUNTRIES,
  COUNTRY_CODES,
  CARGOS_MINISTERIAIS,
  CARGOS_LIDERANCA,
} from "@/data/ministerios";

// ── Types ────────────────────────────────────────────────

type Filho = { nome: string; sobrenome: string; dataNascimento: string; idade: number | null };
type Conjuge = { nome: string; sobrenome: string; dataNascimento: string; idade: number | null };

type FormData = {
  tipo: "individual" | "familiar";
  nome: string; sobrenome: string; email: string;
  dataNascimento: string; idade: number | null; sexo: string;
  pais: string; rua: string; complemento: string; cidade: string; estado: string; zipcode: string;
  telefonePais: string; telefoneNumero: string;
  ministerio: string; congregacao: string; nomePastor: string;
  isMinistro: string; cargoMinisterio: string;
  temCargo: string; cargoLideranca: string;
  conjuge: Conjuge;
  filhos: Filho[];
};

const emptyFilho = (): Filho => ({ nome: "", sobrenome: "", dataNascimento: "", idade: null });
const emptyConjuge = (): Conjuge => ({ nome: "", sobrenome: "", dataNascimento: "", idade: null });

const INIT: FormData = {
  tipo: "individual",
  nome: "", sobrenome: "", email: "",
  dataNascimento: "", idade: null, sexo: "",
  pais: "United States", rua: "", complemento: "", cidade: "", estado: "", zipcode: "",
  telefonePais: "+1", telefoneNumero: "",
  ministerio: "", congregacao: "", nomePastor: "",
  isMinistro: "", cargoMinisterio: "",
  temCargo: "", cargoLideranca: "",
  conjuge: emptyConjuge(),
  filhos: [],
};

// ── Constants ─────────────────────────────────────────────

const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const ANO_ATUAL = new Date().getFullYear();

// ── Helpers ──────────────────────────────────────────────

function calcularIdade(dob: string): number | null {
  if (!dob || dob.length < 10) return null;
  const [d, m, y] = dob.split("/").map(Number);
  if (!d || !m || !y || y < 1900 || y > 2100) return null;
  const birth = new Date(y, m - 1, d);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

// ── DateSelect Component ─────────────────────────────────

function DateSelect({
  value,
  onChangeDob,
  hasError,
}: {
  value: string;
  onChangeDob: (dob: string, idade: number | null) => void;
  hasError?: boolean;
}) {
  const parts = value && value.length >= 10 ? value.split("/") : ["", "", ""];
  const dia = parts[0] ?? "";
  const mes = parts[1] ?? "";
  const ano = parts[2] ?? "";

  function update(d: string, m: string, y: string) {
    const dob = `${d}/${m}/${y}`;
    onChangeDob(dob, d && m && y.length === 4 ? calcularIdade(dob) : null);
  }

  const selectClass = `inscSelect${hasError ? " inscSelectError" : ""}`;

  return (
    <div className="inscDateRow">
      <select className={selectClass} value={dia} onChange={e => update(e.target.value, mes, ano)}>
        <option value="">Dia</option>
        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
          <option key={d} value={String(d).padStart(2, "0")}>{d}</option>
        ))}
      </select>
      <select className={selectClass} value={mes} onChange={e => update(dia, e.target.value, ano)}>
        <option value="">Mês</option>
        {MESES_PT.map((m, i) => (
          <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>
        ))}
      </select>
      <select
        className={selectClass}
        value={ano}
        onChange={e => update(dia, mes, e.target.value)}
      >
        <option value="">Ano</option>
        {Array.from({ length: ANO_ATUAL - 1930 + 1 }, (_, i) => ANO_ATUAL - i).map(y => (
          <option key={y} value={String(y)}>{y}</option>
        ))}
      </select>
    </div>
  );
}

// ── SVG Icons ─────────────────────────────────────────────

const IconMan = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M15 8c1.628 0 3.2 .787 4.707 2.293a1 1 0 0 1 -1.414 1.414c-.848 -.848 -1.662 -1.369 -2.444 -1.587l-.849 5.944v4.936a1 1 0 0 1 -2 0v-4h-2v4a1 1 0 0 1 -2 0v-4.929l-.85 -5.951c-.781 .218 -1.595 .739 -2.443 1.587a1 1 0 1 1 -1.414 -1.414c1.506 -1.506 3.08 -2.293 4.707 -2.293z" />
    <path d="M12 1a3 3 0 1 1 -3 3l.005 -.176a3 3 0 0 1 2.995 -2.824" />
  </svg>
);

const IconWoman = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 1a3 3 0 1 1 -3 3l.005 -.176a3 3 0 0 1 2.995 -2.824" />
    <path d="M12.5 8h-1a4.5 4.5 0 0 0 -4.5 4.5v3.5h2v5a1 1 0 0 0 2 0v-5h2v5a1 1 0 0 0 2 0v-5h2v-3.5a4.5 4.5 0 0 0 -4.5 -4.5z" />
  </svg>
);

const IconFamily = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M10 2a3 3 0 1 1 -3 3l.005 -.176a3 3 0 0 1 2.995 -2.824" />
    <path d="M14 2a3 3 0 1 1 -3 3l.005 -.176a3 3 0 0 1 2.995 -2.824" />
    <path d="M7 8c1.628 0 3.2 .787 4.707 2.293a1 1 0 0 1 -1.414 1.414c-.848 -.848 -1.662 -1.369 -2.444 -1.587l-.849 5.944v4.936a1 1 0 0 1 -2 0v-4h-1v4a1 1 0 0 1 -2 0v-4.929l-.85 -5.951c-.781 .218 -1.595 .739 -2.443 1.587a1 1 0 1 1 -1.414 -1.414c1.506 -1.506 3.08 -2.293 4.707 -2.293z" />
    <path d="M17 8c1.628 0 3.2 .787 4.707 2.293a1 1 0 0 1 -1.414 1.414c-.848 -.848 -1.662 -1.369 -2.444 -1.587l-.849 5.944v4.936a1 1 0 0 1 -2 0v-4h-1v4a1 1 0 0 1 -2 0v-4.929l-.85 -5.951c-.781 .218 -1.595 .739 -2.443 1.587a1 1 0 1 1 -1.414 -1.414c1.506 -1.506 3.08 -2.293 4.707 -2.293z" />
  </svg>
);

const IconIndividual = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M15 8c1.628 0 3.2 .787 4.707 2.293a1 1 0 0 1 -1.414 1.414c-.848 -.848 -1.662 -1.369 -2.444 -1.587l-.849 5.944v4.936a1 1 0 0 1 -2 0v-4h-2v4a1 1 0 0 1 -2 0v-4.929l-.85 -5.951c-.781 .218 -1.595 .739 -2.443 1.587a1 1 0 1 1 -1.414 -1.414c1.506 -1.506 3.08 -2.293 4.707 -2.293z" />
    <path d="M12 1a3 3 0 1 1 -3 3l.005 -.176a3 3 0 0 1 2.995 -2.824" />
  </svg>
);

// ── Main Component ───────────────────────────────────────

export default function InscricoesPage() {
  const [form, setForm] = useState<FormData>(INIT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<number | null>(null);
  const [zipLoading, setZipLoading] = useState(false);

  const set = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }, []);

  const isUSA = form.pais === "United States";

  async function fillByZip(zip: string) {
    if (!isUSA) return;
    const clean = zip.replace(/\D/g, "");
    if (clean.length !== 5) return;
    setZipLoading(true);
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${clean}`);
      if (res.ok) {
        const data = await res.json();
        const place = data.places?.[0];
        if (place) setForm(f => ({ ...f, cidade: place["place name"], estado: place["state abbreviation"] }));
      }
    } catch { /* ignore */ } finally { setZipLoading(false); }
  }

  function handleDob(dob: string, idade: number | null, target: "titular" | "conjuge") {
    if (target === "titular") {
      setForm(f => ({ ...f, dataNascimento: dob, idade }));
      setErrors(e => { const n = { ...e }; delete n.dataNascimento; return n; });
    } else {
      setForm(f => ({ ...f, conjuge: { ...f.conjuge, dataNascimento: dob, idade } }));
    }
  }

  function handleFilhoDob(i: number, dob: string, idade: number | null) {
    setForm(f => {
      const filhos = [...f.filhos];
      filhos[i] = { ...filhos[i], dataNascimento: dob, idade };
      return { ...f, filhos };
    });
  }

  function addFilho() { setForm(f => ({ ...f, filhos: [...f.filhos, emptyFilho()] })); }
  function removeFilho(i: number) { setForm(f => ({ ...f, filhos: f.filhos.filter((_, j) => j !== i) })); }

  function updateFilho(i: number, key: keyof Filho, val: string) {
    setForm(f => {
      const filhos = [...f.filhos];
      filhos[i] = { ...filhos[i], [key]: val };
      return { ...f, filhos };
    });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Obrigatório";
    if (!form.sobrenome.trim()) e.sobrenome = "Obrigatório";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail inválido";
    if (!form.dataNascimento || form.dataNascimento.length < 10) e.dataNascimento = "Data inválida";
    if (!form.sexo) e.sexo = "Selecione o sexo";
    if (!form.pais) e.pais = "Selecione o país";
    if (!form.rua.trim()) e.rua = "Obrigatório";
    if (!form.cidade.trim()) e.cidade = "Obrigatório";
    if (isUSA && !form.estado) e.estado = "Selecione o estado";
    if (!form.zipcode.trim()) e.zipcode = "Obrigatório";
    if (!form.telefoneNumero.trim()) e.telefoneNumero = "Obrigatório";
    if (!form.ministerio) e.ministerio = "Selecione o ministério";
    if (form.ministerio === "Ministério do Belém" && !form.congregacao) e.congregacao = "Selecione a congregação";
    if (form.ministerio && form.ministerio !== "Ministério do Belém" && !form.congregacao.trim()) e.congregacao = "Informe a congregação";
    if (!form.nomePastor.trim()) e.nomePastor = "Obrigatório";
    if (!form.isMinistro) e.isMinistro = "Selecione uma opção";
    if (form.isMinistro === "sim" && !form.cargoMinisterio) e.cargoMinisterio = "Selecione o cargo";
    if (!form.temCargo) e.temCargo = "Selecione uma opção";
    if (form.temCargo === "sim" && !form.cargoLideranca) e.cargoLideranca = "Selecione o cargo";
    if (form.tipo === "familiar") {
      if (!form.conjuge.nome.trim()) e.conjugeNome = "Obrigatório";
      if (!form.conjuge.sobrenome.trim()) e.conjugeSobrenome = "Obrigatório";
      if (!form.conjuge.dataNascimento || form.conjuge.dataNascimento.length < 10) e.conjugeDataNascimento = "Data inválida";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/inscricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.ok) { setSuccess(json.id); window.scrollTo({ top: 0, behavior: "smooth" }); }
      else setErrors({ _: json.error ?? "Erro ao enviar. Tente novamente." });
    } catch { setErrors({ _: "Erro de conexão. Tente novamente." }); }
    finally { setSubmitting(false); }
  }

  // ── Success screen ───────────────────────────────────
  if (success) return (
    <main>
      <section className="pageHero pageHeroSm">
        <p className="pageEyebrow">CONAD 2026</p>
        <h1 className="pageTitle">Inscrição Realizada!</h1>
        <div className="pageDivider" />
        <p className="pageLead">Obrigado, {form.nome}! Sua inscrição foi recebida com sucesso.</p>
      </section>
      <div className="inscSuccessWrap">
        <div className="inscSuccessCard">
          <div className="inscSuccessNum">#{String(success).padStart(5, "0")}</div>
          <p className="inscSuccessLabel">Número da sua inscrição</p>
          <p className="inscSuccessMsg">
            Um e-mail de confirmação foi enviado para <strong>{form.email}</strong>.<br />
            Nossa equipe entrará em contato em breve para finalizar o processo e informar sobre as formas de pagamento.
          </p>
          <button className="inscSubmitBtn" style={{ marginTop: 8 }} onClick={() => { setForm(INIT); setSuccess(null); }}>
            Nova Inscrição
          </button>
        </div>
      </div>
    </main>
  );

  const isBelem = form.ministerio === "Ministério do Belém";
  const isFamiliar = form.tipo === "familiar";
  const isOtherMinisterio = form.ministerio && !isBelem;

  // ── Form ─────────────────────────────────────────────
  return (
    <main>
      {/* Banner */}
      <div className="inscBanner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/inscreva-se-CONAD.png" alt="Inscrições CONAD 2026" />
      </div>

      <div className="inscWrap">
        {errors._ && <div className="inscError">{errors._}</div>}
        {Object.keys(errors).length > 0 && !errors._ && (
          <div className="inscError">Por favor, corrija os campos em vermelho antes de continuar.</div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Tipo ── */}
          <div className="inscSection">
            <h2 className="inscSectionTitle">Tipo de Inscrição</h2>
            <div className="inscTipoToggle">
              <button
                type="button"
                className={`inscTipoBtn${form.tipo === "individual" ? " active" : ""}`}
                onClick={() => set("tipo", "individual")}
              >
                Plano Individual
              </button>
              <button
                type="button"
                className={`inscTipoBtn${form.tipo === "familiar" ? " active" : ""}`}
                onClick={() => set("tipo", "familiar")}
              >
                Plano Familiar
              </button>
            </div>
          </div>

          {/* ── Dados Pessoais ── */}
          <div className="inscSection">
            <h2 className="inscSectionTitle">Dados Pessoais do Titular</h2>

            <div className="inscRow">
              <div className={`inscField${errors.nome ? " hasError" : ""}`}>
                <label className="inscLabel">Nome *</label>
                <input className="inscInput" value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="João" />
                {errors.nome && <span className="inscFieldError">{errors.nome}</span>}
              </div>
              <div className={`inscField${errors.sobrenome ? " hasError" : ""}`}>
                <label className="inscLabel">Sobrenome *</label>
                <input className="inscInput" value={form.sobrenome} onChange={e => set("sobrenome", e.target.value)} placeholder="Silva" />
                {errors.sobrenome && <span className="inscFieldError">{errors.sobrenome}</span>}
              </div>
            </div>

            <div className={`inscField${errors.email ? " hasError" : ""}`}>
              <label className="inscLabel">E-mail *</label>
              <input className="inscInput" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="joao@email.com" />
              {errors.email && <span className="inscFieldError">{errors.email}</span>}
            </div>

            <div className="inscRow">
              <div className={`inscField${errors.dataNascimento ? " hasError" : ""}`}>
                <label className="inscLabel">Data de Nascimento *</label>
                <DateSelect
                  value={form.dataNascimento}
                  onChangeDob={(dob, idade) => handleDob(dob, idade, "titular")}
                  hasError={!!errors.dataNascimento}
                />
                {errors.dataNascimento && <span className="inscFieldError">{errors.dataNascimento}</span>}
              </div>
              <div className="inscField">
                <label className="inscLabel">Idade Atual</label>
                <div className="inscIdadeDisplay">
                  {form.idade !== null ? `${form.idade} anos` : "—"}
                </div>
              </div>
            </div>

            <div className={`inscField${errors.sexo ? " hasError" : ""}`}>
              <label className="inscLabel">Sexo *</label>
              <div className="inscRadioGroup">
                <label className={`inscRadioBtn${form.sexo === "masculino" ? " active" : ""}`}>
                  <input type="radio" name="sexo" value="masculino" checked={form.sexo === "masculino"} onChange={() => set("sexo", "masculino")} />
                  <IconMan /> Masculino
                </label>
                <label className={`inscRadioBtn${form.sexo === "feminino" ? " active" : ""}`}>
                  <input type="radio" name="sexo" value="feminino" checked={form.sexo === "feminino"} onChange={() => set("sexo", "feminino")} />
                  <IconWoman /> Feminino
                </label>
              </div>
              {errors.sexo && <span className="inscFieldError">{errors.sexo}</span>}
            </div>
          </div>

          {/* ── Endereço ── */}
          <div className="inscSection">
            <h2 className="inscSectionTitle">Endereço</h2>

            <div className={`inscField${errors.pais ? " hasError" : ""}`}>
              <label className="inscLabel">País *</label>
              <select
                className="inscSelect"
                value={form.pais}
                onChange={e => {
                  set("pais", e.target.value);
                  set("estado", "");
                  set("zipcode", "");
                }}
              >
                <option value="">Selecione o país</option>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>
              {errors.pais && <span className="inscFieldError">{errors.pais}</span>}
            </div>

            <div className={`inscField${errors.rua ? " hasError" : ""}`}>
              <label className="inscLabel">Número e Rua *</label>
              <input className="inscInput" autoComplete="street-address" value={form.rua} onChange={e => set("rua", e.target.value)} placeholder="123 Main Street" />
              {errors.rua && <span className="inscFieldError">{errors.rua}</span>}
            </div>

            <div className="inscField">
              <label className="inscLabel">Complemento <span className="inscOptional">(opcional)</span></label>
              <input className="inscInput" autoComplete="address-line2" value={form.complemento} onChange={e => set("complemento", e.target.value)} placeholder="Apt 4B, Suite 200..." />
            </div>

            <div className={`inscRow${isUSA ? " inscRow3" : " inscRow2"}`}>
              {isUSA && (
                <div className={`inscField${errors.zipcode ? " hasError" : ""}`}>
                  <label className="inscLabel">ZIP Code *{zipLoading && <span className="inscZipSpin"> ↻</span>}</label>
                  <input
                    className="inscInput"
                    autoComplete="postal-code"
                    value={form.zipcode}
                    onChange={e => set("zipcode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                    onBlur={e => fillByZip(e.target.value)}
                    placeholder="02301"
                    maxLength={5}
                  />
                  {errors.zipcode && <span className="inscFieldError">{errors.zipcode}</span>}
                </div>
              )}
              <div className={`inscField${errors.cidade ? " hasError" : ""}`}>
                <label className="inscLabel">Cidade *</label>
                <input className="inscInput" autoComplete="address-level2" value={form.cidade} onChange={e => set("cidade", e.target.value)} placeholder="Boston" />
                {errors.cidade && <span className="inscFieldError">{errors.cidade}</span>}
              </div>
              {isUSA ? (
                <div className={`inscField${errors.estado ? " hasError" : ""}`}>
                  <label className="inscLabel">Estado *</label>
                  <select className="inscSelect" autoComplete="address-level1" value={form.estado} onChange={e => set("estado", e.target.value)}>
                    <option value="">Selecione</option>
                    {US_STATES.map(s => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
                  </select>
                  {errors.estado && <span className="inscFieldError">{errors.estado}</span>}
                </div>
              ) : (
                <div className="inscField">
                  <label className="inscLabel">Estado / Região</label>
                  <input className="inscInput" autoComplete="address-level1" value={form.estado} onChange={e => set("estado", e.target.value)} placeholder="State / Province" />
                </div>
              )}
            </div>

            {!isUSA && (
              <div className={`inscField${errors.zipcode ? " hasError" : ""}`}>
                <label className="inscLabel">Código Postal</label>
                <input className="inscInput" autoComplete="postal-code" value={form.zipcode} onChange={e => set("zipcode", e.target.value)} placeholder="Postal Code" />
              </div>
            )}
          </div>

          {/* ── Telefone ── */}
          <div className="inscSection">
            <h2 className="inscSectionTitle">Contato</h2>
            <div className={`inscField${errors.telefoneNumero ? " hasError" : ""}`}>
              <label className="inscLabel">Telefone / WhatsApp *</label>
              <div className="inscPhoneRow">
                <select className="inscPhonePais" value={form.telefonePais} onChange={e => set("telefonePais", e.target.value)}>
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code + c.name} value={c.code}>{c.flag} {c.code} {c.name}</option>
                  ))}
                </select>
                <input className="inscInput inscPhoneNum" type="tel" value={form.telefoneNumero} onChange={e => set("telefoneNumero", e.target.value)} placeholder="(508) 555-0100" />
              </div>
              {errors.telefoneNumero && <span className="inscFieldError">{errors.telefoneNumero}</span>}
            </div>
          </div>

          {/* ── Ministério ── */}
          <div className="inscSection">
            <h2 className="inscSectionTitle">Ministério</h2>

            <div className={`inscField${errors.ministerio ? " hasError" : ""}`}>
              <label className="inscLabel">Ministério a que pertence *</label>
              <select className="inscSelect" value={form.ministerio} onChange={e => { set("ministerio", e.target.value); set("congregacao", ""); }}>
                <option value="">Selecione o ministério</option>
                {MINISTERIOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.ministerio && <span className="inscFieldError">{errors.ministerio}</span>}
            </div>

            {/* Ministério do Belém → dropdown de congregações */}
            {isBelem && (
              <div className={`inscField${errors.congregacao ? " hasError" : ""}`}>
                <label className="inscLabel">Congregação *</label>
                <select className="inscSelect" value={form.congregacao} onChange={e => set("congregacao", e.target.value)}>
                  <option value="">Selecione a congregação</option>
                  {CONGREGACOES_BELEM.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.congregacao && <span className="inscFieldError">{errors.congregacao}</span>}
              </div>
            )}

            {/* Outro ministério → campo de texto para congregação */}
            {isOtherMinisterio && (
              <div className={`inscField${errors.congregacao ? " hasError" : ""}`}>
                <label className="inscLabel">Nome da Congregação *</label>
                <input
                  className="inscInput"
                  value={form.congregacao}
                  onChange={e => set("congregacao", e.target.value)}
                  placeholder="Nome da sua congregação"
                />
                {errors.congregacao && <span className="inscFieldError">{errors.congregacao}</span>}
              </div>
            )}

            {/* Campo pastor aparece para qualquer ministério selecionado */}
            {form.ministerio && (
              <div className={`inscField${errors.nomePastor ? " hasError" : ""}`}>
                <label className="inscLabel">Nome do Pastor na congregação onde você serve *</label>
                <input className="inscInput" value={form.nomePastor} onChange={e => set("nomePastor", e.target.value)} placeholder="Pr. José Silva" />
                {errors.nomePastor && <span className="inscFieldError">{errors.nomePastor}</span>}
              </div>
            )}
          </div>

          {/* ── Ministério Pessoal ── */}
          <div className="inscSection">
            <h2 className="inscSectionTitle">Ministério Pessoal</h2>

            <div className={`inscField${errors.isMinistro ? " hasError" : ""}`}>
              <label className="inscLabel">Você é um ministro? *</label>
              <div className="inscRadioGroup">
                {[["nao", "Não"], ["sim", "Sim"]].map(([val, label]) => (
                  <label key={val} className={`inscRadioBtn${form.isMinistro === val ? " active" : ""}`}>
                    <input type="radio" name="isMinistro" value={val} checked={form.isMinistro === val} onChange={() => { set("isMinistro", val); set("cargoMinisterio", ""); }} />
                    {label}
                  </label>
                ))}
              </div>
              {errors.isMinistro && <span className="inscFieldError">{errors.isMinistro}</span>}
            </div>

            {form.isMinistro === "sim" && (
              <div className={`inscField${errors.cargoMinisterio ? " hasError" : ""}`}>
                <label className="inscLabel">Cargo ministerial *</label>
                <select className="inscSelect" value={form.cargoMinisterio} onChange={e => set("cargoMinisterio", e.target.value)}>
                  <option value="">Selecione o cargo</option>
                  {CARGOS_MINISTERIAIS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.cargoMinisterio && <span className="inscFieldError">{errors.cargoMinisterio}</span>}
              </div>
            )}
          </div>

          {/* ── Liderança ── */}
          <div className="inscSection">
            <h2 className="inscSectionTitle">Cargo na Liderança</h2>

            <div className={`inscField${errors.temCargo ? " hasError" : ""}`}>
              <label className="inscLabel">Você possui algum cargo na liderança? *</label>
              <div className="inscRadioGroup">
                {[["nao", "Não"], ["sim", "Sim"]].map(([val, label]) => (
                  <label key={val} className={`inscRadioBtn${form.temCargo === val ? " active" : ""}`}>
                    <input type="radio" name="temCargo" value={val} checked={form.temCargo === val} onChange={() => { set("temCargo", val); set("cargoLideranca", ""); }} />
                    {label}
                  </label>
                ))}
              </div>
              {errors.temCargo && <span className="inscFieldError">{errors.temCargo}</span>}
            </div>

            {form.temCargo === "sim" && (
              <div className={`inscField${errors.cargoLideranca ? " hasError" : ""}`}>
                <label className="inscLabel">Cargo na liderança *</label>
                <select className="inscSelect" value={form.cargoLideranca} onChange={e => set("cargoLideranca", e.target.value)}>
                  <option value="">Selecione o cargo</option>
                  {CARGOS_LIDERANCA.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.cargoLideranca && <span className="inscFieldError">{errors.cargoLideranca}</span>}
              </div>
            )}
          </div>

          {/* ── Cônjuge (familiar) ── */}
          {isFamiliar && (
            <div className="inscSection inscSectionFamily">
              <h2 className="inscSectionTitle">Dados do Cônjuge</h2>

              <div className="inscRow">
                <div className={`inscField${errors.conjugeNome ? " hasError" : ""}`}>
                  <label className="inscLabel">Nome *</label>
                  <input className="inscInput" value={form.conjuge.nome} onChange={e => setForm(f => ({ ...f, conjuge: { ...f.conjuge, nome: e.target.value } }))} placeholder="Maria" />
                  {errors.conjugeNome && <span className="inscFieldError">{errors.conjugeNome}</span>}
                </div>
                <div className={`inscField${errors.conjugeSobrenome ? " hasError" : ""}`}>
                  <label className="inscLabel">Sobrenome *</label>
                  <input className="inscInput" value={form.conjuge.sobrenome} onChange={e => setForm(f => ({ ...f, conjuge: { ...f.conjuge, sobrenome: e.target.value } }))} placeholder="Silva" />
                  {errors.conjugeSobrenome && <span className="inscFieldError">{errors.conjugeSobrenome}</span>}
                </div>
              </div>

              <div className="inscRow">
                <div className={`inscField${errors.conjugeDataNascimento ? " hasError" : ""}`}>
                  <label className="inscLabel">Data de Nascimento *</label>
                  <DateSelect
                    value={form.conjuge.dataNascimento}
                    onChangeDob={(dob, idade) => handleDob(dob, idade, "conjuge")}
                    hasError={!!errors.conjugeDataNascimento}
                  />
                  {errors.conjugeDataNascimento && <span className="inscFieldError">{errors.conjugeDataNascimento}</span>}
                </div>
                <div className="inscField">
                  <label className="inscLabel">Idade Atual</label>
                  <div className="inscIdadeDisplay">{form.conjuge.idade !== null ? `${form.conjuge.idade} anos` : "—"}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Filhos (familiar) ── */}
          {isFamiliar && (
            <div className="inscSection inscSectionFamily">
              <h2 className="inscSectionTitle">Filhos</h2>

              {form.filhos.length === 0 && (
                <p className="inscFilhosVazio">Nenhum filho adicionado. Clique no botão abaixo para adicionar.</p>
              )}

              {form.filhos.map((filho, i) => (
                <div key={i} className="inscFilhoCard">
                  <div className="inscFilhoCardHeader">
                    <span>Filho {i + 1}</span>
                    <button type="button" className="inscFilhoRemove" onClick={() => removeFilho(i)}>Remover</button>
                  </div>
                  <div className="inscRow inscRow3">
                    <div className="inscField">
                      <label className="inscLabel">Nome *</label>
                      <input className="inscInput" value={filho.nome} onChange={e => updateFilho(i, "nome", e.target.value)} placeholder="Pedro" />
                    </div>
                    <div className="inscField">
                      <label className="inscLabel">Sobrenome *</label>
                      <input className="inscInput" value={filho.sobrenome} onChange={e => updateFilho(i, "sobrenome", e.target.value)} placeholder="Silva" />
                    </div>
                    <div className="inscField">
                      <label className="inscLabel">Data de Nascimento *</label>
                      <DateSelect
                        value={filho.dataNascimento}
                        onChangeDob={(dob, idade) => handleFilhoDob(i, dob, idade)}
                      />
                    </div>
                  </div>
                  {filho.idade !== null && (
                    <p className="inscFilhoIdade">{filho.idade === 0 ? "Menos de 1 ano" : `${filho.idade} anos`}</p>
                  )}
                </div>
              ))}

              <button type="button" className="inscAddFilhoBtn" onClick={addFilho}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Adicionar Filho
              </button>
            </div>
          )}

          {/* ── Submit ── */}
          <div className="inscSubmitWrap">
            <button type="submit" className="inscSubmitBtn" disabled={submitting}>
              {submitting ? "Enviando..." : "Finalizar Inscrição"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
