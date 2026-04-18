"use client";

import React, { useState, useEffect } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { PROJECTS } from "@/lib/data";

export function SearchPalette() {
  const { searchOpen: open, setSearchOpen: onClose, setOpenedProject: onOpen } = useProjectHouse();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const s = q.toLowerCase();
  const results = q
    ? PROJECTS.filter((p) => (p.title + p.tag + p.stack.join(" ")).toLowerCase().includes(s)).slice(0, 6)
    : PROJECTS.slice(0, 5);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#0A0F2C90",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "start center",
        paddingTop: "12vh",
      }}
      onClick={() => onClose(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(620px,92vw)",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 40px 80px -20px rgba(0,0,0,.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search 48 projects, stacks, or topics…"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--ink)", fontSize: 17, fontFamily: "inherit" }}
          />
          <span className="mono" style={{ fontSize: 11, color: "var(--muted)", border: "1px solid var(--line)", padding: "2px 7px", borderRadius: 4 }}>
            ESC
          </span>
        </div>
        <div className="scroll" style={{ maxHeight: "52vh", overflowY: "auto" }}>
          {results.length === 0 && <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--muted)" }}>No matches</div>}
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onOpen(p);
                onClose(false);
              }}
              style={{
                width: "100%",
                padding: "14px 20px",
                display: "flex",
                gap: 14,
                alignItems: "center",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--line)",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                color: "var(--ink)",
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 8, background: p.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.title}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  {p.tag} · ₹{p.price.toLocaleString("en-IN")}
                </div>
              </div>
              <span style={{ color: "var(--muted)" }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
