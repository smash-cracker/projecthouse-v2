"use client";

import React, { useEffect } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";

export function TweakPanel() {
  const { tweaksVisible: visible, accent, setAccent, setTweaksVisible } = useProjectHouse();
  const swatches = ["#D7FF3A", "#FF8A5C", "#7CFFD4", "#FFD84D", "#C3B1FF", "#FF6B9A"];

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksVisible(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksVisible(false);
    };
    window.addEventListener("message", onMsg);
    try {
      window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    } catch {}
    return () => window.removeEventListener("message", onMsg);
  }, [setTweaksVisible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 300,
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 24px 48px -12px rgba(0,0,0,.25)",
        width: 260,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)" }}>
          Tweaks
        </div>
      </div>
      <div style={{ fontSize: 13, marginBottom: 8 }}>Accent color</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {swatches.map((c) => (
          <button
            key={c}
            onClick={() => setAccent(c)}
            aria-label={c}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: accent === c ? "2px solid var(--ink)" : "1px solid var(--line)",
              background: c,
              cursor: "pointer",
            }}
          />
        ))}
        <label
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px dashed var(--line)",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>
            #
          </span>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
          />
        </label>
      </div>
      <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 10 }}>
        changes persist when saved
      </div>
    </div>
  );
}
