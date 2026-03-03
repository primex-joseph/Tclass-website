import { NextRequest, NextResponse } from "next/server";

function imageFallback(label: string) {
  const safeLabel = label.replace(/[<>&"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="300" viewBox="0 0 420 300">
  <rect width="420" height="300" fill="#f8fafc" stroke="#111827" stroke-width="2"/>
  <text x="210" y="150" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#334155">${safeLabel}</text>
</svg>`;
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return imageFallback("Image not available");
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return imageFallback("Invalid image URL");
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return imageFallback("Unsupported image URL");
  }

  try {
    const upstream = await fetch(target.toString(), {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
    });

    if (!upstream.ok) return imageFallback("Image not found");

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const data = await upstream.arrayBuffer();

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return imageFallback("Image fetch failed");
  }
}
