"use client";

import React from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { ArrowUpRight, Star } from "../ui/icons";
import { PROJECTS } from "@/lib/data";

function ThumbArt({ kind, accent, color }: { kind: string; accent: string; color: string }) {
  const bg = color && color !== "#FF8A5C" ? color : "var(--indigo-deep)";
  const fg = color === "#FF8A5C" ? "var(--ink)" : "#fff";
  if (kind === "notebook") {
    return (
      <div style={{ flex: 1, background: "var(--paper-2)", padding: 10 }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>
          notebook.ipynb
        </div>
        {[100, 72, 88, 60, 82, 54].map((w, i) => (
          <div
            key={i}
            style={{
              height: 4,
              width: w + "%",
              background: i === 2 ? accent : "var(--line)",
              borderRadius: 2,
              marginTop: 6,
            }}
          />
        ))}
        <div
          style={{
            marginTop: 10,
            height: 44,
            borderRadius: 6,
            background: bg,
            display: "flex",
            alignItems: "end",
            gap: 3,
            padding: 6,
          }}
        >
          {[40, 72, 30, 88, 55, 90, 64, 78].map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: h + "%",
                background: i % 3 === 0 ? accent : "rgba(255,255,255,.4)",
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      </div>
    );
  }
  if (kind === "code") {
    return (
      <div style={{ flex: 1, background: "var(--ink)", padding: 10 }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff6b6b" }} />
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffd93d" }} />
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} />
        </div>
        {[
          ["import", "torch"],
          ["model", "= Net()"],
          ["for", "epoch in"],
          ["loss", ".backward()"],
          ["→", "94.2% acc"],
        ].map((p, i) => (
          <div key={i} className="mono" style={{ fontSize: 9, marginBottom: 4, display: "flex", gap: 6 }}>
            <span style={{ color: accent }}>{p[0]}</span>
            <span style={{ color: "#cfd3ee" }}>{p[1]}</span>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "chart") {
    return (
      <div style={{ flex: 1, background: bg, padding: 12, position: "relative" }}>
        <svg viewBox="0 0 100 60" style={{ width: "100%", height: "100%" }}>
          <polyline
            fill="none"
            stroke={accent}
            strokeWidth="2"
            points="0,50 12,42 24,46 36,30 48,33 60,18 72,22 84,10 100,14"
          />
          <polyline
            fill="none"
            stroke="rgba(255,255,255,.35)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            points="0,55 100,30"
          />
        </svg>
        <div className="mono" style={{ position: "absolute", left: 10, top: 8, fontSize: 9, color: fg, opacity: .8 }}>
          loss ↓
        </div>
      </div>
    );
  }
  if (kind === "phone") {
    return (
      <div style={{ flex: 1, background: "var(--paper-2)", display: "grid", placeItems: "center", padding: 10 }}>
        <div style={{ width: 70, height: 110, background: "var(--ink)", borderRadius: 12, padding: 6, position: "relative" }}>
          <div style={{ height: "100%", background: bg, borderRadius: 8, padding: 6, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ height: 6, background: accent, width: "40%", borderRadius: 2 }} />
            <div style={{ height: 4, background: "rgba(255,255,255,.4)", borderRadius: 2 }} />
            <div style={{ height: 4, background: "rgba(255,255,255,.3)", width: "70%", borderRadius: 2 }} />
            <div style={{ flex: 1, background: "rgba(255,255,255,.15)", borderRadius: 4, marginTop: 4 }} />
          </div>
        </div>
      </div>
    );
  }
  if (kind === "heatmap") {
    return (
      <div style={{ flex: 1, background: "var(--card)", padding: 10, display: "grid", gridTemplateColumns: "repeat(8,1fr)", gridAutoRows: "1fr", gap: 2 }}>
        {Array.from({ length: 48 }).map((_, i) => {
          const v = (Math.sin(i * 1.7) + 1) / 2;
          const useAccent = v > 0.7;
          return (
            <div
              key={i}
              style={{
                background: useAccent ? accent : `rgba(42,47,184,${0.1 + v * 0.7})`,
                borderRadius: 2,
              }}
            />
          );
        })}
      </div>
    );
  }
  if (kind === "terminal") {
    return (
      <div style={{ flex: 1, background: "var(--ink)", padding: 10 }}>
        {["$ python train.py", "epoch 12/30", "val_acc: 0.942", "✓ saved model.pt"].map((t, i) => (
          <div key={i} className="mono" style={{ fontSize: 9, color: i === 3 ? accent : "#cfd3ee", marginBottom: 3 }}>
            {t}
          </div>
        ))}
        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          <span className="mono" style={{ fontSize: 9, color: accent }}>
            ▊
          </span>
        </div>
      </div>
    );
  }
  return null;
}

function ThumbCollage({ thumbs, accent }: { thumbs: any[]; accent: string }) {
  const tiles = [
    { x: 0, y: 10, w: 190, h: 240, r: -6, i: 0, kind: "notebook" },
    { x: 200, y: 0, w: 210, h: 160, r: 4, i: 1, kind: "code" },
    { x: 190, y: 170, w: 150, h: 150, r: -3, i: 2, kind: "chart" },
    { x: 355, y: 170, w: 140, h: 140, r: 6, i: 3, kind: "phone" },
    { x: 30, y: 265, w: 170, h: 170, r: 3, i: 4, kind: "heatmap" },
    { x: 360, y: 325, w: 160, h: 110, r: -4, i: 5, kind: "terminal" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {tiles.map((t) => {
        const p = thumbs[t.i];
        return (
          <div
            key={t.i}
            style={{
              position: "absolute",
              left: t.x,
              top: t.y,
              width: t.w,
              height: t.h,
              transform: `rotate(${t.r}deg)`,
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              boxShadow: "0 20px 40px -20px #0A0F2C22, 0 4px 12px -8px #0A0F2C18",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ThumbArt kind={t.kind} accent={accent} color={p.color} />
            <div style={{ padding: "8px 10px", borderTop: "1px solid var(--line)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.title}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                ₹{p.price.toLocaleString("en-IN")} · {p.tag}
              </div>
            </div>
          </div>
        );
      })}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: -30,
          top: 80,
          width: 110,
          height: 110,
          background: accent,
          borderRadius: "50%",
          filter: "blur(.5px)",
          zIndex: -1,
        }}
      />
    </div>
  );
}

export function Hero() {
  const { accent } = useProjectHouse();
  const thumbs = PROJECTS.slice(0, 6);

  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, #000 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, #000 40%, transparent 85%)",
        }}
      />
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 28px 60px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: "var(--card)",
              border: "1px solid var(--line)",
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 0 3px ${accent}33`,
              }}
            />
            48 ready-made projects · updated April &apos;26
          </span>
        </div>

        <h1
          className="serif"
          style={{
            margin: 0,
            fontSize: "clamp(56px, 8.2vw, 128px)",
            lineHeight: 0.95,
            letterSpacing: "-.02em",
            maxWidth: 1200,
          }}
        >
          Ship your capstone.
          <br />
          Not your weekends.
          <br />
          <span style={{ fontStyle: "italic", position: "relative" }}>
            Built for students.
            <svg
              aria-hidden
              viewBox="0 0 600 20"
              style={{ position: "absolute", left: 0, right: 0, bottom: -6, width: "72%", height: 14, overflow: "visible" }}
            >
              <path d="M2 14 C 120 2, 300 2, 598 12" stroke={accent} strokeWidth="8" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, marginTop: 44, alignItems: "end" }}>
          <div>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--muted)", maxWidth: 520, margin: 0 }}>
              ML, deep learning, computer vision, full-stack web, and mobile — every project ships with source, dataset,
              a viva-ready report, and a human to answer your doubts.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <button
                onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  padding: "16px 22px",
                  borderRadius: 999,
                  border: "none",
                  background: accent,
                  color: "var(--accent-ink)",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                Browse the catalog
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--ink)",
                    color: "var(--paper)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <ArrowUpRight />
                </span>
              </button>
              <button
                style={{
                  padding: "16px 22px",
                  borderRadius: 999,
                  border: "1px solid var(--line)",
                  background: "transparent",
                  color: "var(--ink)",
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                How it works →
              </button>
            </div>
            <div style={{ display: "flex", gap: 36, marginTop: 40 }}>
              {[
                { n: "48", l: "Capstone-ready projects" },
                { n: "12k+", l: "Students shipped" },
                { n: "4.8", l: "Avg. rating", star: true },
              ].map((s) => (
                <div key={s.l}>
                  <div className="serif" style={{ fontSize: 56, lineHeight: 1, display: "flex", alignItems: "baseline", gap: 6 }}>
                    {s.n}
                    {s.star && <Star size={18} />}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, maxWidth: 140 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", height: 460 }}>
            <ThumbCollage thumbs={thumbs} accent={accent} />
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
          marginTop: 20,
          overflow: "hidden",
          background: "var(--paper-2)",
        }}
      >
        <div style={{ display: "flex", gap: 48, padding: "18px 0", whiteSpace: "nowrap", animation: "marquee 40s linear infinite" }}>
          {[...Array(2)].map((_, k) => (
            <div key={k} style={{ display: "flex", gap: 48, paddingRight: 48 }}>
              {[
                "Source code",
                "Clean dataset",
                "IEEE-style report",
                "Setup guide",
                "Deployment",
                "Q&A support",
                "Reference papers",
                "Viva prep",
                "Source code",
                "Clean dataset",
                "IEEE-style report",
                "Setup guide",
                "Deployment",
                "Q&A support",
              ].map((t, i) => (
                <span key={i} className="mono" style={{ fontSize: 13, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 6, height: 6, background: accent, borderRadius: "50%" }} /> {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
