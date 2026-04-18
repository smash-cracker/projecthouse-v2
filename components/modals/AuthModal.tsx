"use client";

import React, { useEffect } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";

export function AuthModal() {
  const { authOpen: open, setAuthOpen: onClose, setUser, accent } = useProjectHouse();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const signIn = (provider: string) => {
    // Mock OAuth — in real build, redirects to /auth/google or /auth/github
    const profiles: Record<string, any> = {
      google: { provider: "google", name: "Aarav Mehta", email: "aarav.mehta@gmail.com", handle: "aarav.mehta", avatar: "AM" },
      github: { provider: "github", name: "Aarav Mehta", email: "aarav@users.noreply.github.com", handle: "aaravmehta", avatar: "AM" },
    };
    const u = profiles[provider];
    setUser(u);
    localStorage.setItem("ph-user", JSON.stringify(u));
    onClose(false);
  };

  if (!open) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 150, display: "grid", placeItems: "center", padding: 20 }}
      onClick={() => onClose(false)}
    >
      <div style={{ position: "absolute", inset: 0, background: "#0A0F2C90", backdropFilter: "blur(6px)" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(420px,100%)",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 20,
          boxShadow: "0 40px 80px -20px rgba(0,0,0,.5)",
          padding: 32,
          textAlign: "center"
        }}
      >
        <button
          onClick={() => onClose(false)}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: 999,
            border: "1px solid var(--line)",
            background: "transparent",
            fontSize: 18,
            cursor: "pointer",
            color: "var(--ink)"
          }}
        >
          ×
        </button>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: accent, margin: "0 auto", marginBottom: 16 }} />
        <h3 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: "-.02em" }}>Sign in</h3>
        <p style={{ fontSize: 15, color: "var(--muted)", margin: "8px 0 24px" }}>
          Access your purchased projects and downloads.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => signIn("google")}
            style={{
              padding: "14px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "var(--card)",
              color: "var(--ink)",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10
            }}
          >
            Sign in with Google
          </button>
          <button
            onClick={() => signIn("github")}
            style={{
              padding: "14px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "var(--card)",
              color: "var(--ink)",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10
            }}
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
