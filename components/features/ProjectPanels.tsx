"use client";

import React from "react";
import { CATEGORIES } from "@/lib/data";
import type { ProjectSummary } from "@/lib/types";

// ─── Abstract ──────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
        {label}
      </div>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: "var(--ink)" }}>{children}</p>
    </div>
  );
}

export function AbstractPanel({ p }: { p: ProjectSummary }) {
  const ab = p.abstract || {
    objective: p.description,
    methodology: "Detailed methodology available in the full report included with purchase.",
    results: "Results documented in the final report.",
    keywords: p.stack.join(", "),
  };
  const catLabel = CATEGORIES.find((c) => c.id === p.cat)?.label.toUpperCase() || "";

  const downloadPDF = async () => {
    // Loaded on demand — keeps jsPDF out of the initial page bundle.
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const M = 54;
    let y = 70;
    doc.setFillColor(10, 15, 44);
    doc.rect(0, 0, W, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PROJECT HOUSE  //  ABSTRACT", M, 25);
    doc.setTextColor(10, 15, 44);

    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.text(catLabel + "  ·  " + p.level, M, y);
    y += 18;
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    const titleLines = doc.splitTextToSize(p.title, W - M * 2);
    doc.text(titleLines, M, y);
    y += titleLines.length * 24 + 6;

    doc.setDrawColor(10, 15, 44);
    doc.setLineWidth(1.2);
    doc.line(M, y, M + 60, y);
    y += 22;

    const section = (h: string, body: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(90, 96, 120);
      doc.text(h.toUpperCase(), M, y);
      y += 14;
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(10, 15, 44);
      const lines = doc.splitTextToSize(body, W - M * 2);
      doc.text(lines, M, y, { lineHeightFactor: 1.45 });
      y += lines.length * 14 + 18;
    };
    section("Objective", ab.objective);
    section("Methodology", ab.methodology);
    section("Results & evaluation", ab.results);
    section("Keywords", ab.keywords);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 96, 120);
    doc.text("projecthouse.dev  ·  " + p.id + "  ·  one-page abstract", M, doc.internal.pageSize.getHeight() - 30);
    doc.save(p.id + "-abstract.pdf");
  };

  const downloadDOCX = async () => {
    // Loaded on demand — keeps JSZip out of the initial page bundle.
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const para = (text: string, { bold = false, size = 22, color = "0A0F2C", italic = false, spaceAfter = 160 } = {}) => `
<w:p><w:pPr><w:spacing w:after="${spaceAfter}"/></w:pPr><w:r><w:rPr>${bold ? "<w:b/>" : ""}${italic ? "<w:i/>" : ""}<w:sz w:val="${size}"/><w:color w:val="${color}"/><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`;
    const heading = (t: string) => para(t, { bold: true, size: 18, color: "5A6078", spaceAfter: 80 });

    const body = [
      para("PROJECT HOUSE  //  ABSTRACT", { bold: true, size: 18, color: "5A6078", spaceAfter: 120 }),
      para(catLabel + "  ·  " + p.level, { italic: true, size: 18, color: "5A6078", spaceAfter: 120 }),
      para(p.title, { bold: true, size: 44, spaceAfter: 280 }),
      heading("Objective"),
      para(ab.objective),
      heading("Methodology"),
      para(ab.methodology),
      heading("Results & evaluation"),
      para(ab.results),
      heading("Keywords"),
      para(ab.keywords),
      para("projecthouse.dev · " + p.id + " · one-page abstract", { size: 16, color: "5A6078", spaceAfter: 0 }),
    ].join("");

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body>
</w:document>`;
    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
    const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
    zip.file("[Content_Types].xml", contentTypes);
    zip.folder("_rels")?.file(".rels", rootRels);
    zip.folder("word")?.file("document.xml", documentXml);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = p.id + "-abstract.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div>
      <div style={{ padding: "22px 24px", background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14 }}>
        <Section label="Objective">{ab.objective}</Section>
        <Section label="Methodology">{ab.methodology}</Section>
        <Section label="Results & evaluation">{ab.results}</Section>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {ab.keywords.split(",").map((k: string) => (
            <span key={k} className="mono" style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "var(--paper-2)", color: "var(--muted)" }}>
              {k.trim()}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={downloadPDF}
          style={{
            flex: 1, minWidth: 200, padding: "14px 18px", borderRadius: 12,
            border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)",
            cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 500,
            display: "inline-flex", alignItems: "center", gap: 12,
          }}
        >
          <span style={{ width: 36, height: 36, borderRadius: 8, background: "#E03E3E", color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
            PDF
          </span>
          <span style={{ textAlign: "left" }}>
            <div>Download abstract (PDF)</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 2, fontWeight: 400 }}>A4 · 1 page · ~24 KB</div>
          </span>
        </button>
        <button
          onClick={downloadDOCX}
          style={{
            flex: 1, minWidth: 200, padding: "14px 18px", borderRadius: 12,
            border: "1px solid var(--line)", background: "var(--card)", color: "var(--ink)",
            cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 500,
            display: "inline-flex", alignItems: "center", gap: 12,
          }}
        >
          <span style={{ width: 36, height: 36, borderRadius: 8, background: "#2B579A", color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
            DOCX
          </span>
          <span style={{ textAlign: "left" }}>
            <div>Download abstract (Word)</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 2, fontWeight: 400 }}>Editable · ~8 KB</div>
          </span>
        </button>
      </div>
    </div>
  );
}

// ─── Tech Stack ────────────────────────────────────────────────────────────

function toArr(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v as string[];
  return [String(v)];
}

function Pill({ children, tone = "default", accent }: { children: React.ReactNode; tone?: string; accent: string }) {
  return (
    <span
      className="mono"
      style={{
        fontSize: 12, padding: "6px 12px", borderRadius: 999,
        background: tone === "accent" ? accent : "var(--card)",
        color: tone === "accent" ? "var(--accent-ink)" : "var(--ink)",
        border: tone === "accent" ? "none" : "1px solid var(--line)",
      }}
    >
      {children}
    </span>
  );
}

function Row({ icon, label, items, tone, accent }: { icon: React.ReactNode; label: string; items: string[]; tone?: string; accent: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 20, padding: "16px 0", borderBottom: "1px solid var(--line)", alignItems: "start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: tone === "accent" ? accent : "var(--paper-2)",
          color: tone === "accent" ? "var(--accent-ink)" : "var(--ink)",
          display: "grid", placeItems: "center",
        }}>
          {icon}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {items.map((x, i) => <Pill key={i} tone={tone} accent={accent}>{x}</Pill>)}
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, tone, accent }: { label: string; value: string; sub?: string; tone?: string; accent: string }) {
  return (
    <div style={{
      padding: "16px 18px", borderRadius: 14,
      background: tone === "accent" ? accent : "var(--card)",
      color: tone === "accent" ? "var(--accent-ink)" : "var(--ink)",
      border: tone === "accent" ? "none" : "1px solid var(--line)",
    }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", opacity: 0.7 }}>{label}</div>
      <div className="serif" style={{ fontSize: 26, lineHeight: 1.1, letterSpacing: "-.01em", marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

const ICONS = {
  brain: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M5 3a2 2 0 014 0 2 2 0 012 2v1a2 2 0 010 4v1a2 2 0 01-2 2 2 2 0 01-4 0 2 2 0 01-2-2v-1a2 2 0 010-4V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.2"/></svg>,
  data: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="4" rx="5" ry="2" stroke="currentColor" strokeWidth="1.2"/><path d="M3 4v8c0 1.1 2.24 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.24 2 5 2s5-.9 5-2" stroke="currentColor" strokeWidth="1.2"/></svg>,
  target: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r=".8" fill="currentColor"/></svg>,
  frontend: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><path d="M2 6h12" stroke="currentColor" strokeWidth="1.2"/></svg>,
  backend: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="3" rx=".8" stroke="currentColor" strokeWidth="1.2"/><rect x="2" y="8" width="12" height="3" rx=".8" stroke="currentColor" strokeWidth="1.2"/><circle cx="4.5" cy="4.5" r=".5" fill="currentColor"/><circle cx="4.5" cy="9.5" r=".5" fill="currentColor"/></svg>,
  db: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="4" rx="5" ry="1.6" stroke="currentColor" strokeWidth="1.2"/><path d="M3 4v8c0 .9 2.24 1.6 5 1.6s5-.7 5-1.6V4" stroke="currentColor" strokeWidth="1.2"/></svg>,
  lock: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.2"/></svg>,
  cloud: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 12a3 3 0 010-6 4 4 0 017.5-1 3 3 0 01.5 6H4z" stroke="currentColor" strokeWidth="1.2"/></svg>,
  train: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 13l3-3 2 2 4-4 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

export function StackPanel({ p, accent }: { p: ProjectSummary; accent: string }) {
  const s = p.stack_detail || {};
  const isModel = s.kind === "ml" || s.kind === "dl";

  return (
    <div>
      {isModel && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
          <MetricCard accent={accent} label="Algorithm" value={s.algorithm?.split(" ").slice(0, 3).join(" ") || "—"} sub={s.algorithm} />
          <MetricCard accent={accent} label="Accuracy" value={(s.accuracy || "—").split(" ·")[0]} sub={s.accuracy} tone="accent" />
          <MetricCard accent={accent} label="Dataset" value={(s.dataset || "—").split(" ·")[0]} sub={s.dataset} />
        </div>
      )}
      {!isModel && (s.kind === "web" || s.kind === "mob") && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
          <MetricCard accent={accent} label="Platform" value={s.kind === "web" ? "Web" : "Mobile"} sub={s.kind === "web" ? "Responsive, PWA-ready" : "iOS + Android"} />
          <MetricCard accent={accent} label="Architecture" value={s.kind === "web" ? "Full-stack" : "Cross-platform"} sub={p.stack.join(" · ")} tone="accent" />
          <MetricCard accent={accent} label="Auth" value={toArr(s.auth)[0] || "JWT"} sub={s.auth ? toArr(s.auth).join(" · ") : "Standard auth flow"} />
        </div>
      )}

      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "4px 20px" }}>
        {isModel && (
          <>
            {s.algorithm && <Row accent={accent} icon={ICONS.brain} label="Algorithm" items={[s.algorithm]} tone="accent" />}
            {s.training && <Row accent={accent} icon={ICONS.train} label="Training" items={[s.training]} />}
            {s.dataset && <Row accent={accent} icon={ICONS.data} label="Dataset" items={[s.dataset]} />}
            {s.accuracy && <Row accent={accent} icon={ICONS.target} label="Accuracy" items={s.accuracy.split(" · ")} />}
          </>
        )}
        {s.model && <Row accent={accent} icon={ICONS.brain} label="Model" items={[s.model]} tone="accent" />}
        {s.frontend && <Row accent={accent} icon={ICONS.frontend} label="Frontend" items={toArr(s.frontend)} />}
        {s.backend && <Row accent={accent} icon={ICONS.backend} label="Backend" items={toArr(s.backend)} />}
        {s.db && <Row accent={accent} icon={ICONS.db} label="Database" items={toArr(s.db)} />}
        {s.auth && <Row accent={accent} icon={ICONS.lock} label="Auth" items={toArr(s.auth)} />}
        {s.deploy && <Row accent={accent} icon={ICONS.cloud} label="Deploy" items={toArr(s.deploy)} />}
      </div>
    </div>
  );
}
