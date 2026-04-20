"use client";

import React, { useState } from "react";
import { CATEGORIES } from "@/lib/data";
import { Star, ArrowUpRight } from "../ui/icons";

export function CardArt({ project: p, accent, hover }: { project: any; accent: string; hover: boolean }) {
  const light = p.color === "#FF8A5C";
  const fg = light ? "var(--ink)" : "#ffffff";
  const sub = light ? "rgba(10,15,44,.55)" : "rgba(255,255,255,.6)";
  const tx = hover ? "scale(1.04)" : "scale(1)";
  const base: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    transition: "transform .35s",
    transform: tx,
  };

  if (p.cat === "ml") {
    return (
      <div style={{ ...base }}>
        <svg viewBox="0 0 400 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <g opacity="0.25">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line key={i} x1="0" x2="400" y1={30 + i * 25} y2={30 + i * 25} stroke={fg} strokeWidth=".5" />
            ))}
          </g>
          <polyline
            points="0,160 40,140 80,145 120,115 160,120 200,85 240,95 280,60 320,72 360,40 400,48"
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <polyline
            points="0,170 40,168 80,150 120,155 160,130 200,135 240,110 280,120 320,95 360,100 400,80"
            fill="none"
            stroke={fg}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity=".6"
          />
        </svg>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="mono" style={{ fontSize: 11, color: sub }}>
            accuracy
          </div>
          <div className="serif" style={{ fontSize: 40, lineHeight: 1, color: fg }}>
            94.2<span style={{ fontSize: 20 }}>%</span>
          </div>
        </div>
      </div>
    );
  }
  if (p.cat === "dl") {
    return (
      <div style={{ ...base, justifyContent: "center", alignItems: "center" }}>
        <svg viewBox="0 0 300 170" width="80%" height="80%">
          {[0, 1, 2, 3].map((layer) => {
            const n = [4, 5, 5, 3][layer];
            return Array.from({ length: n }).map((_, i) => {
              const cx = 40 + layer * 70,
                cy = 85 + (i - (n - 1) / 2) * 22;
              return (
                <g key={layer + "-" + i}>
                  {layer < 3 &&
                    Array.from({ length: [5, 5, 3][layer] }).map((_, j) => {
                      const n2 = [5, 5, 3][layer];
                      const cx2 = 40 + (layer + 1) * 70,
                        cy2 = 85 + (j - (n2 - 1) / 2) * 22;
                      return <line key={j} x1={cx} y1={cy} x2={cx2} y2={cy2} stroke={fg} strokeWidth=".5" opacity=".3" />;
                    })}
                  <circle cx={cx} cy={cy} r="5" fill={layer === 2 ? accent : fg} />
                </g>
              );
            });
          })}
        </svg>
        <div className="mono" style={{ position: "absolute", left: 18, bottom: 18, fontSize: 11, color: sub }}>
          3-stream LSTM · 28 FPS
        </div>
      </div>
    );
  }
  if (p.cat === "cv") {
    return (
      <div style={{ ...base }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `repeating-linear-gradient(90deg, transparent 0 19px, ${fg}15 19px 20px),repeating-linear-gradient(0deg, transparent 0 19px, ${fg}15 19px 20px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "20%",
            width: 110,
            height: 90,
            border: `2px solid ${accent}`,
            borderRadius: 4,
          }}
        >
          <span
            className="mono"
            style={{
              position: "absolute",
              top: -18,
              left: 0,
              fontSize: 10,
              color: accent,
              background: "var(--ink)",
              padding: "1px 5px",
              borderRadius: 2,
            }}
          >
            conf .98
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "15%",
            width: 60,
            height: 60,
            border: `2px solid ${fg}`,
            borderRadius: "50%",
            opacity: 0.8,
          }}
        >
          <span className="mono" style={{ position: "absolute", top: -16, right: 0, fontSize: 10, color: fg }}>
            .87
          </span>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="mono" style={{ fontSize: 11, color: sub }}>
            detections
          </div>
        </div>
      </div>
    );
  }
  if (p.cat === "web") {
    return (
      <div style={{ ...base, justifyContent: "center", padding: 24 }}>
        <div
          style={{
            background: light ? "rgba(10,15,44,.08)" : "rgba(255,255,255,.1)",
            borderRadius: 10,
            padding: 10,
            backdropFilter: "blur(6px)",
            border: `1px solid ${light ? "rgba(10,15,44,.15)" : "rgba(255,255,255,.2)"}`,
          }}
        >
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: fg, opacity: 0.6 }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: fg, opacity: 0.4 }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: fg, opacity: 0.3 }} />
            <span
              style={{
                flex: 1,
                height: 8,
                background: light ? "rgba(10,15,44,.12)" : "rgba(255,255,255,.15)",
                borderRadius: 999,
                marginLeft: 6,
              }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 8 }}>
            <div style={{ height: 70, background: light ? "rgba(10,15,44,.1)" : "rgba(255,255,255,.1)", borderRadius: 6 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 6, background: accent, borderRadius: 2, width: "60%" }} />
              <div style={{ height: 5, background: light ? "rgba(10,15,44,.15)" : "rgba(255,255,255,.15)", borderRadius: 2 }} />
              <div
                style={{
                  height: 5,
                  background: light ? "rgba(10,15,44,.15)" : "rgba(255,255,255,.15)",
                  borderRadius: 2,
                  width: "80%",
                }}
              />
              <div style={{ height: 16, background: accent, borderRadius: 3, width: 60, marginTop: 4 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (p.cat === "mob") {
    return (
      <div style={{ ...base, justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 110,
            height: 170,
            background: "var(--ink)",
            borderRadius: 18,
            padding: 6,
            boxShadow: "0 20px 30px -10px rgba(0,0,0,.4)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: light ? "var(--paper)" : "var(--indigo)",
              borderRadius: 13,
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ height: 6, background: accent, width: "50%", borderRadius: 2 }} />
            <div style={{ height: 4, background: light ? "rgba(10,15,44,.2)" : "rgba(255,255,255,.3)", borderRadius: 2 }} />
            <div
              style={{ height: 4, background: light ? "rgba(10,15,44,.2)" : "rgba(255,255,255,.3)", width: "70%", borderRadius: 2 }}
            />
            <div
              style={{
                flex: 1,
                background: light ? "rgba(10,15,44,.08)" : "rgba(255,255,255,.15)",
                borderRadius: 6,
                marginTop: 2,
                display: "grid",
                placeItems: "center",
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: accent }} />
            </div>
            <div style={{ height: 14, background: accent, borderRadius: 3 }} />
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function ProjectCard({
  p,
  accent,
  onOpen,
  featured,
}: {
  p: any;
  accent: string;
  onOpen: (p: any) => void;
  featured: boolean;
}) {
  const [hover, setHover] = useState(false);
  const cat = CATEGORIES.find((c) => c.id === p.cat);
  
  if (!cat) return null;

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(p)}
      style={{
        border: "1px solid var(--line)",
        borderRadius: 18,
        background: "var(--card)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform .2s, box-shadow .2s, border-color .2s",
        transform: hover ? "translateY(-4px)" : "none",
        boxShadow: hover ? "0 24px 40px -20px #0A0F2C25" : "0 1px 0 var(--line)",
        borderColor: hover ? "var(--ink)" : "var(--line)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "relative", height: featured ? 240 : 180, background: p.color, overflow: "hidden" }}>
        <CardArt project={p} accent={accent} hover={hover} />
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          <span
            className="mono"
            style={{
              fontSize: 10,
              padding: "4px 8px",
              borderRadius: 4,
              background: "rgba(255,255,255,.15)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.2)",
            }}
          >
            {cat.label}
          </span>
          <span
            className="mono"
            style={{
              fontSize: 10,
              padding: "4px 8px",
              borderRadius: 4,
              background: "rgba(255,255,255,.15)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.2)",
            }}
          >
            {p.level}
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "5px 10px",
            borderRadius: 999,
            background: accent,
            color: "var(--accent-ink)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ₹{p.price.toLocaleString("en-IN")}
        </div>
      </div>
      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {p.stack.slice(0, 3).map((s: string) => (
            <span
              key={s}
              className="mono"
              style={{
                fontSize: 10,
                padding: "2px 7px",
                borderRadius: 999,
                background: "var(--paper-2)",
                color: "var(--muted)",
              }}
            >
              {s}
            </span>
          ))}
          {p.stack.length > 3 && (
            <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>
              +{p.stack.length - 3}
            </span>
          )}
        </div>
        <h3 style={{ fontSize: 18, lineHeight: 1.25, margin: 0, letterSpacing: "-.01em", fontWeight: 600 }}>{p.title}</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, margin: "8px 0 0", flex: 1 }}>
          {p.description?.length > 110 ? p.description.slice(0, 110) + "…" : p.description}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid var(--line)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
            <span style={{ color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 600 }}>
              <Star /> {p.rating.toFixed(1)}
            </span>
            · {p.downloads.toLocaleString()} downloads
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "var(--ink)",
              fontWeight: 500,
            }}
          >
            Details <ArrowUpRight />
          </span>
        </div>
      </div>
    </article>
  );
}
