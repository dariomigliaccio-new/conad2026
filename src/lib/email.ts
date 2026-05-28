export async function sendConfirmationEmail(to: string, nome: string, id: number) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email] RESEND_API_KEY not set — skipping email to ${to}`);
    return;
  }

  const html = `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#FBF6EC;padding:40px 32px;border:1px solid #D8C9A8;">
      <img src="https://conad2026.com/images/conad-logo.png" alt="CONAD 2026" style="height:60px;display:block;margin:0 auto 32px;" />
      <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:300;color:#1C0E04;text-align:center;margin:0 0 8px;">Inscrição Recebida!</h1>
      <p style="text-align:center;color:#C98418;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin:0 0 32px;">Confirmação nº ${id}</p>
      <p style="color:#1C0E04;font-size:16px;line-height:1.6;">Olá, <strong>${nome}</strong>,</p>
      <p style="color:#1C0E04;font-size:16px;line-height:1.6;">Sua inscrição para o <strong>CONAD 2026</strong> foi recebida com sucesso.</p>
      <p style="color:#7A5A38;font-size:15px;line-height:1.6;">Nossa equipe entrará em contato em breve para finalizar o processo e informar sobre as formas de pagamento disponíveis.</p>
      <div style="background:#fff;border:1px solid #D8C9A8;border-radius:8px;padding:20px;margin:28px 0;">
        <p style="margin:0;font-size:13px;color:#7A5A38;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">Número da inscrição</p>
        <p style="margin:6px 0 0;font-size:28px;font-weight:800;color:#C98418;letter-spacing:-.02em;">#${String(id).padStart(5, "0")}</p>
      </div>
      <p style="color:#7A5A38;font-size:14px;line-height:1.6;margin:0;">Guarde este e-mail como comprovante. Em caso de dúvidas, entre em contato com nossa equipe.</p>
      <hr style="border:none;border-top:1px solid #D8C9A8;margin:32px 0;" />
      <p style="color:#aaa;font-size:11px;text-align:center;margin:0;">CONAD 2026 — 15–17 de Agosto de 2026</p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CONAD 2026 <inscricoes@conad2026.org>",
      to,
      subject: `Inscrição CONAD 2026 recebida — nº ${String(id).padStart(5, "0")}`,
      html,
    }),
  }).catch(err => console.error("[email] Resend error:", err));
}
