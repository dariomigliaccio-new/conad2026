"use client";
import { useRef, useState } from "react";

type Props = {
  onUpload: (url: string) => void;
  label?: string;
};

export function UploadInput({ onUpload, label = "Carregar imagem" }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    if (r.ok) {
      const { url } = await r.json();
      onUpload(url);
    } else {
      setError("Erro no upload.");
    }
    setLoading(false);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div className="uploadInputWrap">
      <input ref={ref} type="file" accept="image/*" onChange={handle} style={{ display: "none" }} />
      <button
        type="button"
        className="adminButton uploadBtn"
        onClick={() => ref.current?.click()}
        disabled={loading}
      >
        {loading ? "Enviando..." : label}
      </button>
      {error && <span style={{ color: "#c0392b", fontSize: 12, marginLeft: 10 }}>{error}</span>}
    </div>
  );
}
