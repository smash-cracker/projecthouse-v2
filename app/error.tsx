"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 24px",
        background: "var(--paper)",
        color: "var(--ink)",
      }}
    >
      <div style={{ maxWidth: 460, textAlign: "center" }}>
        <div
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Error
        </div>
        <h1
          className="serif"
          style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-.02em", margin: "10px 0 0" }}
        >
          This page hit a <span style={{ fontStyle: "italic" }}>snag.</span>
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)", margin: "14px 0 0" }}>
          The rest of the site is still up. Try again, or head back to the catalog.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 26 }}>
          <button
            onClick={reset}
            style={{
              padding: "12px 20px",
              borderRadius: 999,
              border: "none",
              background: "var(--ink)",
              color: "var(--paper)",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              padding: "12px 20px",
              borderRadius: 999,
              border: "1px solid var(--line)",
              background: "var(--card)",
              color: "var(--ink)",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
