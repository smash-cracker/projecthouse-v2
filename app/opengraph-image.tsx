import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Project House — Ready-made capstone projects for students";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0A0F2C",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, #2A2FB844 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -60,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, #2A2FB833 0%, transparent 70%)",
          }}
        />

        {/* Tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 36,
          }}
        >
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
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            maxWidth: 820,
          }}
        >
          Ready-made capstone projects for students.
        </div>

        {/* Subtext */}
        <div
          style={{
            marginTop: 32,
            fontSize: 26,
            color: "#8892B0",
            lineHeight: 1.5,
            maxWidth: 680,
          }}
        >
          ML · Deep Learning · Computer Vision · Web · Mobile
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 96,
            right: 96,
            height: 1,
            background: "#1E2A5E",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: 96,
            fontSize: 16,
            color: "#3D4F8A",
            letterSpacing: "0.04em",
          }}
        >
          www.projecthouse.in
        </div>
      </div>
    ),
    size
  );
}
