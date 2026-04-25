import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CAT_LABELS: Record<string, string> = {
  ml: "Machine Learning",
  dl: "Deep Learning",
  cv: "Computer Vision",
  web: "Web Application",
  mob: "Mobile Application",
};

type Props = { params: Promise<{ id: string }> };

export default async function ProjectOgImage({ params }: Props) {
  const { id } = await params;

  let title = "Capstone Project";
  let description = "";
  let cat = "";
  let stack: string[] = [];

  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/projects?id=eq.${encodeURIComponent(id)}&select=title,description,cat,stack&limit=1`;
    const res = await fetch(url, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    });
    const rows = await res.json();
    if (rows?.[0]) {
      title = rows[0].title ?? title;
      description = rows[0].description ?? "";
      cat = rows[0].cat ?? "";
      stack = rows[0].stack ?? [];
    }
  } catch {
    // fall through to defaults
  }

  const categoryLabel = CAT_LABELS[cat] ?? "";
  const stackPreview = stack.slice(0, 4).join("  ·  ");

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0A0F2C",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 96px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -60,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, #2A2FB855 0%, transparent 65%)",
          }}
        />

        {/* Top — branding + category */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              background: "#2A2FB8",
              borderRadius: 8,
              padding: "6px 16px",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Project House
          </div>
          {categoryLabel && (
            <div
              style={{
                borderRadius: 8,
                padding: "6px 16px",
                fontSize: 15,
                fontWeight: 500,
                color: "#8892B0",
                border: "1px solid #1E2A5E",
              }}
            >
              {categoryLabel}
            </div>
          )}
        </div>

        {/* Middle — title + description */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: title.length > 40 ? 58 : 68,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 22,
                color: "#8892B0",
                lineHeight: 1.5,
                maxWidth: 780,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </div>
          )}
        </div>

        {/* Bottom — stack + url */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {stackPreview && (
            <div
              style={{
                fontSize: 17,
                color: "#3D4F8A",
                letterSpacing: "0.03em",
              }}
            >
              {stackPreview}
            </div>
          )}
          <div
            style={{
              fontSize: 16,
              color: "#3D4F8A",
              letterSpacing: "0.04em",
              marginLeft: "auto",
            }}
          >
            www.projecthouse.in
          </div>
        </div>
      </div>
    ),
    size
  );
}
