import React from "react";

export const ArrowUpRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M3.5 10.5L10.5 3.5M10.5 3.5H5M10.5 3.5V9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Star = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor" aria-hidden>
    <path d="M6 .8l1.5 3.3 3.6.4-2.7 2.5.8 3.6L6 8.9 2.8 10.6l.8-3.6L.9 4.5l3.6-.4L6 .8z" />
  </svg>
);

export const Logo = ({ accent }: { accent: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ position: "relative", width: 32, height: 32 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--indigo-deep)",
          borderRadius: 6,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "6px 3px 3px 6px",
          background: accent,
          borderRadius: 4,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 3,
          right: 3,
          width: 10,
          height: 10,
          background: "var(--ink)",
          borderRadius: "50%",
        }}
      />
    </div>
    <div style={{ fontSize: 22, lineHeight: 1 }} className="serif">
      Project<span style={{ fontStyle: "italic" }}>House</span>
    </div>
  </div>
);

export const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path
      d="M1 5l3.5 3.5L12 1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CopyIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 13 14" fill="none">
    <rect x="3.5" y="1" width="8" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M2 4h-.5A.5.5 0 001 4.5V13a.5.5 0 00.5.5H9" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);
