"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass }),
    });
    if (r.ok) {
      router.push("/admin");
    } else {
      const d = await r.json();
      setError(d.error ?? "Erro ao entrar.");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f7f7f5",
    }}>
      <form onSubmit={handle} style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: 4,
        padding: "48px 40px",
        width: "100%",
        maxWidth: 380,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".22em", color: "#999", margin: "0 0 6px", textTransform: "uppercase" }}>CONAD 2026</p>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Painel Administrativo</h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#555" }}>E-mail</label>
          <input
            type="email"
            value={user}
            onChange={e => setUser(e.target.value)}
            required
            autoComplete="username"
            style={{ border: "1px solid #ccc", borderRadius: 3, padding: "10px 12px", fontSize: 14, outline: "none" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#555" }}>Senha</label>
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            required
            autoComplete="current-password"
            style={{ border: "1px solid #ccc", borderRadius: 3, padding: "10px 12px", fontSize: 14, outline: "none" }}
          />
        </div>

        {error && (
          <p style={{ margin: 0, fontSize: 13, color: "#c0392b", textAlign: "center" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 3,
            padding: "13px",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginTop: 4,
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
