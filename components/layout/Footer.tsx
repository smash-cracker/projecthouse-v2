"use client";

import React from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { Logo } from "../ui/icons";

export function Footer() {
  const { accent } = useProjectHouse();

  return (
    <footer style={{ background: "#0A0F2C", color: "#F3F0E6", marginTop: 60 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "90px 28px 40px" }}>
        <h3
          className="serif"
          style={{
            fontSize: "clamp(52px,7vw,120px)",
            lineHeight: 0.95,
            letterSpacing: "-.03em",
            margin: 0,
            maxWidth: 1200,
          }}
        >
          Get it by <span style={{ fontStyle: "italic", color: accent }}>Tomorrow</span>
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 48,
            marginTop: 72,
            paddingTop: 32,
            borderTop: "1px solid rgba(255,255,255,.15)",
          }}
        >
          <div>
            <Logo accent={accent} />
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,.6)",
                maxWidth: 360,
                marginTop: 18,
                lineHeight: 1.6,
              }}
            >
              Ready-made capstone projects for students who have better things to do than re-invent the wheel.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 18, alignItems: "center" }}>
              <input
                placeholder="you@college.ac.in"
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,.2)",
                  background: "transparent",
                  color: "var(--paper)",
                  fontFamily: "inherit",
                  fontSize: 13,
                  maxWidth: 280,
                }}
              />
              <button
                style={{
                  padding: "12px 18px",
                  borderRadius: 999,
                  border: "none",
                  background: accent,
                  color: "var(--accent-ink)",
                  fontFamily: "inherit",
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Notify me
              </button>
            </div>
          </div>
          {(
            [
              [
                "Catalog",
                [
                  "All projects",
                  "Machine Learning",
                  "Deep Learning",
                  "Computer Vision",
                  "Web apps",
                  "Mobile apps",
                ],
              ],
              ["Students", ["Pricing", "Student discount", "Viva prep", "Live support", "FAQ"]],
              ["Company", ["About", "For colleges", "Affiliate", "Contact", "Terms"]],
            ] as [string, string[]][]
          ).map(([h, items]) => (
            <div key={h}>
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.5)",
                }}
              >
                {h}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "16px 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {items.map((i) => (
                  <li key={i}>
                    <a
                      href="#"
                      style={{ color: "rgba(255,255,255,.85)", textDecoration: "none", fontSize: 14 }}
                    >
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 60,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,.15)",
            fontSize: 12,
            color: "rgba(255,255,255,.5)",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span>© 2026 Project House. Built for people who build.</span>
          <span className="mono">v2.4 · 48 projects · last drop 03 Apr</span>
        </div>
      </div>
    </footer>
  );
}
