export const runtime = "nodejs";
export const maxDuration = 60;

const sanitizeFileName = (fileName: string) =>
  (fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-") || "stylized-image.png").slice(0, 120);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get("url");
  const fileName = sanitizeFileName(url.searchParams.get("filename") ?? "stylized-image.png");
  const inline = url.searchParams.get("inline") === "true";

  if (!imageUrl || !/^https?:\/\//.test(imageUrl)) {
    return Response.json({ error: "Invalid image url" }, { status: 400 });
  }

  const response = await fetch(imageUrl);

  if (!response.ok) {
    return Response.json({ error: `Image download failed with ${response.status}` }, { status: response.status });
  }

  const contentType = response.headers.get("content-type") ?? "image/png";

  return new Response(response.body, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${fileName}"`,
      "Content-Type": contentType,
    },
  });
}
