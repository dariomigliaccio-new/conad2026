export async function GET() {
  return Response.json({
    app: "conad2026",
    status: "ok",
    version: "next",
  });
}
