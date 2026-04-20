"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/data";
import { CardArt } from "@/components/features/ProjectCard";
import { Star, ArrowUpRight } from "@/components/ui/icons";
import { useProjectHouse } from "@/components/providers/ThemeProvider";

function PurchasedCard({ payment, accent }: { payment: any; accent: string }) {
  const [hover, setHover] = useState(false);
  const p = payment.project;
  const cat = CATEGORIES.find((c) => c.id === p?.cat);
  const paidDate = new Date(payment.created_at).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <a
      href={`/projects/${payment.project_id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: "1px solid var(--line)",
        borderRadius: 18,
        background: "var(--card)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform .2s, box-shadow .2s, border-color .2s",
        transform: hover ? "translateY(-4px)" : "none",
        boxShadow: hover ? "0 24px 40px -20px #0A0F2C25" : "0 1px 0 var(--line)",
        borderColor: hover ? "var(--ink)" : "var(--line)",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Art area */}
      <div style={{ position: "relative", height: 180, background: p?.color ?? "#2A2FB8", overflow: "hidden" }}>
        {p && <CardArt project={p} accent={accent} hover={hover} />}

        {/* Top-left badges */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          {cat && (
            <span className="mono" style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,.2)" }}>
              {cat.label}
            </span>
          )}
          {p?.level && (
            <span className="mono" style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,.2)" }}>
              {p.level}
            </span>
          )}
        </div>

        {/* Purchased badge top-right */}
        <div style={{ position: "absolute", top: 12, right: 12, padding: "5px 10px", borderRadius: 999, background: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: 600, border: "1px solid #6EE7B7" }}>
          Purchased
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Stack pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {p?.stack?.slice(0, 3).map((s: string) => (
            <span key={s} className="mono" style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "var(--paper-2)", color: "var(--muted)" }}>
              {s}
            </span>
          ))}
          {p?.stack?.length > 3 && (
            <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>+{p.stack.length - 3}</span>
          )}
        </div>

        <h3 style={{ fontSize: 18, lineHeight: 1.25, margin: 0, letterSpacing: "-.01em", fontWeight: 600 }}>
          {payment.project_title}
        </h3>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, margin: "8px 0 0", flex: 1 }}>
          {p?.description?.length > 110 ? p.description.slice(0, 110) + "…" : p?.description}
        </p>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {p?.rating && (
              <span style={{ color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 600, marginRight: 6 }}>
                <Star /> {p.rating.toFixed(1)}
              </span>
            )}
            {paidDate}
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>
            Open project <ArrowUpRight />
          </span>
        </div>
      </div>
    </a>
  );
}

export function MyProjectsGrid({ payments }: { payments: any[] }) {
  const { accent } = useProjectHouse();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
      {payments.map((payment) => (
        <PurchasedCard key={payment.id} payment={payment} accent={accent} />
      ))}
    </div>
  );
}
