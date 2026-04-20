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
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "#0A0F2C80",
          backdropFilter: "blur(4px)",
          animation: "fadein .2s",
        }}
      />

      {/* Card */}
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
        {/* Checkmark circle */}
        <div
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: accent,
            margin: "0 auto",
            display: "grid", placeItems: "center",
          }}
        >
          <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
            <path d="M2 11l9 9L28 2" stroke="var(--accent-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h3
          className="serif"
          style={{ fontSize: 36, margin: "18px 0 8px", letterSpacing: "-.02em" }}
        >
          Payment successful.
        </h3>

        <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 6px", lineHeight: 1.55 }}>
          You now have access to{" "}
          <b style={{ color: "var(--ink)" }}>{projectTitle}</b>.
        </p>

        <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 24px", lineHeight: 1.55 }}>
          Amount paid:{" "}
          <b style={{ color: "var(--ink)" }}>₹{(amount / 100).toLocaleString("en-IN")}</b>
        </p>

        {/* Payment ID */}
        <div
          className="mono"
          style={{
            fontSize: 11, color: "var(--muted)",
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: "8px 14px",
            marginBottom: 28,
            letterSpacing: ".04em",
            wordBreak: "break-all",
          }}
        >
          {paymentId}
        </div>

        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 20px", lineHeight: 1.5 }}>
          Please take a screenshot of this page for your records.
        </p>

        <button
          onClick={onClose}
          style={{
            padding: "14px 32px", borderRadius: 999, border: "none",
            background: "var(--ink)", color: "var(--paper)",
            fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer",
            width: "100%",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
