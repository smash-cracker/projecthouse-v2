import React from "react";

/** Small numeric stat tile used by the drawer and the project page. */
export function Stat({
  n,
  l,
  size = "md",
}: {
  n: number | string;
  l: string;
  size?: "sm" | "md";
}) {
  const compact = size === "sm";
  return (
    <div
      style={{
        padding: compact ? "14px 16px" : "16px 20px",
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: compact ? 10 : 12,
      }}
    >
      <div
        className="serif"
        style={{ fontSize: compact ? 32 : 36, lineHeight: 1, letterSpacing: "-.02em" }}
      >
        {n}
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: compact ? 4 : 6 }}>{l}</div>
    </div>
  );
}
