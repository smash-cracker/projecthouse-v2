"use client";

import { useEffect } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";

interface Props {
  projectTitle: string;
  errorDescription?: string;
  accent: string;
  onRetry: () => void;
  onClose: () => void;
}

export function PaymentFailureModal({ projectTitle, errorDescription, accent, onRetry, onClose }: Props) {
  const isMobile = useIsMobile();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "#0A0F2C80",
          backdropFilter: "blur(4px)",
          animation: "fadein .2s",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "calc(100vw - 32px)" : 440,
          background: "var(--paper)",
          borderRadius: 20,
          padding: isMobile ? "32px 24px" : "48px 40px",
          textAlign: "center",
          animation: "slidein .28s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {/* X circle */}
        <div
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#FEE2E2",
            margin: "0 auto",
            display: "grid", placeItems: "center",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <h3
          className="serif"
          style={{ fontSize: 36, margin: "18px 0 8px", letterSpacing: "-.02em" }}
        >
          Payment failed.
        </h3>

        <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 6px", lineHeight: 1.55 }}>
          We couldn&apos;t complete your purchase for{" "}
          <b style={{ color: "var(--ink)" }}>{projectTitle}</b>.
        </p>

        {errorDescription && (
          <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 24px", lineHeight: 1.55 }}>
            {errorDescription}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: errorDescription ? 0 : 24 }}>
          <button
            onClick={onRetry}
            style={{
              padding: "14px 32px", borderRadius: 999, border: "none",
              background: accent, color: "var(--accent-ink)",
              fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer",
              width: "100%",
            }}
          >
            Try again
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "14px 32px", borderRadius: 999,
              border: "1px solid var(--line)", background: "transparent",
              color: "var(--ink)", fontFamily: "inherit", fontSize: 14,
              fontWeight: 500, cursor: "pointer", width: "100%",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
