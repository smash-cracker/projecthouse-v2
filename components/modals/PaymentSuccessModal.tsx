"use client";

import { useEffect } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";

interface Props {
  projectTitle: string;
  paymentId: string;
  amount: number;
  accent: string;
  onClose: () => void;
}

export function PaymentSuccessModal({ projectTitle, paymentId, amount, accent, onClose }: Props) {
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
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute", inset: 0,
          background: "#0A0F2C90",
          backdropFilter: "blur(6px)",
          animation: "fadein .2s",
        }}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(560px, 100%)",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 20,
          boxShadow: "0 40px 80px -20px rgba(0,0,0,.5)",
          overflow: "hidden",
          animation: "paymentPopIn .28s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: isMobile ? "14px 16px" : "22px 28px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            className="mono"
            style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)" }}
          >
            Payment successful
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 999, border: "1px solid var(--line)",
              background: "transparent", fontSize: 18, cursor: "pointer", color: "var(--ink)",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? "32px 24px" : "48px 40px", textAlign: "center" }}>
          <div
            style={{
              width: 72, height: 72, borderRadius: "50%",
              background: accent,
              margin: "0 auto",
              display: "grid", placeItems: "center",
              boxShadow: `0 8px 24px ${accent}55`,
            }}
          >
            <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
              <path d="M2 11l9 9L28 2" stroke="var(--accent-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h3 className="serif" style={{ fontSize: 36, margin: "18px 0 8px", letterSpacing: "-.02em" }}>
            Payment successful.
          </h3>

          <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 6px", lineHeight: 1.55 }}>
            You now have full access to{" "}
            <b style={{ color: "var(--ink)" }}>{projectTitle}</b>.
          </p>

          <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 24px", lineHeight: 1.55 }}>
            Amount paid:{" "}
            <b style={{ color: "var(--ink)" }}>₹{(amount / 100).toLocaleString("en-IN")}</b>
          </p>

          <div
            className="mono"
            style={{
              fontSize: 11, color: "var(--muted)",
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "8px 14px",
              marginBottom: 12,
              letterSpacing: ".04em",
              wordBreak: "break-all",
            }}
          >
            {paymentId}
          </div>

          <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 28px", lineHeight: 1.5 }}>
            Please screenshot this page for your records.
          </p>

          <button
            onClick={onClose}
            style={{
              padding: "14px 26px", borderRadius: 999, border: "none",
              background: "var(--ink)", color: "var(--paper)",
              fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer",
              width: "100%",
            }}
          >
            Done
          </button>
        </div>
      </div>

      <style>{`
        @keyframes paymentPopIn {
          from { opacity: 0; transform: translateY(16px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}
