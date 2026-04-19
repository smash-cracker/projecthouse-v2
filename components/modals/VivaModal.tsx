"use client";

import React, { useState, useEffect } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { VIVA_TABS, VIVA_QA } from "@/lib/data";

export function VivaModal() {
  const { vivaOpen, setVivaOpen, accent } = useProjectHouse();
  const [tab, setTab] = useState("ml");
  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const switchTab = (id: string) => { setTab(id); setOpenIdx(null); setQuery(""); };

  useEffect(() => {
    if (!vivaOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setVivaOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [vivaOpen, setVivaOpen]);

  if (!vivaOpen) return null;

  const q = query.trim().toLowerCase();
  const allForTab = VIVA_QA[tab] || [];
  const items = q
    ? Object.values(VIVA_QA).flat().filter((item) =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      )
    : allForTab;
  const isSearching = q.length > 0;
  const totalCount = Object.values(VIVA_QA).reduce((s, arr) => s + arr.length, 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", flexDirection: "column", background: "var(--paper)" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--line)", padding: "0 28px", display: "flex", alignItems: "center", gap: 16, height: 64, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
          <span style={{ fontSize: 20 }}>🎓</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Viva Prep</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--muted)", background: "var(--card)", padding: "2px 8px", borderRadius: 6 }}>
            {totalCount} questions
          </span>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 480, display: "flex", alignItems: "center", gap: 10, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 10, padding: "9px 14px" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: "var(--muted)" }}>
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpenIdx(null); }}
            placeholder="Search all questions…"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--ink)", fontSize: 14, fontFamily: "inherit" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
          )}
        </div>

        <button
          onClick={() => setVivaOpen(false)}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "var(--ink)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Close <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>ESC</span>
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar — hidden while searching */}
        {!isSearching && (
          <div style={{ width: 220, borderRight: "1px solid var(--line)", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0, overflowY: "auto" }}>
            {VIVA_TABS.map((t) => {
              const active = tab === t.id;
              const count = (VIVA_QA[t.id] || []).length;
              return (
                <button
                  key={t.id}
                  onClick={() => switchTab(t.id)}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 10, border: "none",
                    background: active ? accent : "transparent",
                    color: active ? "var(--accent-ink)" : "var(--ink)",
                    fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 400,
                    cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 9,
                    transition: "background .15s",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <span style={{ flex: 1 }}>{t.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.6 }}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Questions list */}
        <div className="scroll" style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {isSearching && (
            <div style={{ marginBottom: 20, fontSize: 13, color: "var(--muted)" }}>
              {items.length} result{items.length !== 1 ? "s" : ""} for <strong style={{ color: "var(--ink)" }}>"{query}"</strong>
            </div>
          )}

          {items.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>No questions match "{query}"</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Try different keywords or clear the search.</div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: "100%" }}>
            {items.map((item, i) => {
              const isOpen = openIdx === i;
              return (
                <div
                  key={i}
                  style={{
                    border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden",
                    background: "var(--card)",
                    boxShadow: isOpen ? `0 0 0 2px ${accent}55` : "none",
                    transition: "box-shadow .15s",
                  }}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    style={{
                      width: "100%", padding: "16px 20px", display: "flex", alignItems: "center",
                      justifyContent: "space-between", gap: 16, background: "transparent", border: "none",
                      cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 500,
                      color: "var(--ink)", textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="mono" style={{
                        fontSize: 10,
                        background: isOpen ? accent : "var(--line)",
                        color: isOpen ? "var(--accent-ink)" : "var(--muted)",
                        padding: "2px 7px", borderRadius: 5, flexShrink: 0, transition: "all .15s",
                      }}>Q{i + 1}</span>
                      {item.q}
                    </div>
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: isOpen ? accent : "var(--line)",
                      display: "grid", placeItems: "center", flexShrink: 0,
                      transition: "background .15s, transform .15s",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                    }}>
                      <svg width="9" height="9" viewBox="0 0 10 10">
                        <path d="M5 1v8M1 5h8" stroke={isOpen ? "var(--accent-ink)" : "var(--ink)"} strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 20px 16px", display: "flex", gap: 12, alignItems: "start", borderTop: "1px solid var(--line)" }}>
                      <span className="mono" style={{ fontSize: 10, background: "var(--paper)", color: "var(--muted)", padding: "2px 7px", borderRadius: 5, flexShrink: 0, marginTop: 14 }}>ANS</span>
                      <p style={{ margin: "12px 0 0", fontSize: 14, color: "var(--muted)", lineHeight: 1.75 }}>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!isSearching && (
            <div style={{ marginTop: 32, padding: "18px 22px", border: "1px dashed var(--line)", borderRadius: 12, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "space-between", maxWidth: "100%" }}>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>Want project-specific prep?</span> Every purchase includes a viva Q&amp;A guide tailored to your exact implementation.
              </div>
              <a
                href="#catalog"
                onClick={() => setVivaOpen(false)}
                style={{ padding: "10px 18px", borderRadius: 999, background: accent, color: "var(--accent-ink)", textDecoration: "none", fontSize: 13, fontWeight: 500, flexShrink: 0 }}
              >
                Browse projects →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
