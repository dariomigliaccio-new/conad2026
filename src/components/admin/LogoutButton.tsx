"use client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={logout}
      style={{
        marginTop: "auto",
        padding: "10px 16px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".1em",
        textTransform: "uppercase",
        background: "transparent",
        border: "1px solid rgba(255,255,255,.2)",
        color: "rgba(255,255,255,.6)",
        borderRadius: 3,
        cursor: "pointer",
        width: "calc(100% - 32px)",
        margin: "16px",
        transition: "color .15s, border-color .15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = "#fff";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,.5)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,.6)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,.2)";
      }}
    >
      Sair
    </button>
  );
}
