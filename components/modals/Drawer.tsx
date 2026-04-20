"use client";

import React, { useState, useEffect } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { CATEGORIES } from "@/lib/data";
import { ArrowUpRight, Star } from "../ui/icons";
import { useIsMobile } from "../../hooks/useIsMobile";

import { DemoModal } from "./DemoModal";
import { PaymentSuccessModal } from "./PaymentSuccessModal";
import RazorpayButton from "../ui/RazorpayButton";
import { jsPDF } from "jspdf";
import JSZip from "jszip";

function StackPanel({ p, accent }: { p: any; accent: string }) {
  const s = p.stack_detail || {};
  const isModel = s.kind === "ml" || s.kind === "dl";

  const Pill = ({ children, tone = "default" }: { children: React.ReactNode; tone?: string }) => (
    <span
      className="mono"
      style={{
        fontSize: 12,
        padding: "6px 12px",
        borderRadius: 999,
        background: tone === "accent" ? accent : "var(--card)",
        color: tone === "accent" ? "var(--accent-ink)" : "var(--ink)",
        border: tone === "accent" ? "none" : "1px solid var(--line)",
      }}
    >
      {children}
    </span>
  );

  const Row = ({ icon, label, items, tone }: { icon: React.ReactNode; label: string; items: string[]; tone?: string }) => (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 20, padding: "16px 0", borderBottom: "1px solid var(--line)", alignItems: "start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: tone === "accent" ? accent : "var(--paper-2)",
            color: tone === "accent" ? "var(--accent-ink)" : "var(--ink)",
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {items.map((x, i) => (
          <Pill key={i} tone={tone}>
            {x}
          </Pill>
        ))}
      </div>
    </div>
  );

  const MetricCard = ({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) => (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: 14,
        background: tone === "accent" ? accent : "var(--card)",
        color: tone === "accent" ? "var(--accent-ink)" : "var(--ink)",
        border: tone === "accent" ? "none" : "1px solid var(--line)",
      }}
    >
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", opacity: 0.7 }}>
        {label}
      </div>
      <div className="serif" style={{ fontSize: 26, lineHeight: 1.1, letterSpacing: "-.01em", marginTop: 6 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  const ic = {
    brain: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M5 3a2 2 0 014 0 2 2 0 012 2v1a2 2 0 010 4v1a2 2 0 01-2 2 2 2 0 01-4 0 2 2 0 01-2-2v-1a2 2 0 010-4V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    data: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <ellipse cx="8" cy="4" rx="5" ry="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M3 4v8c0 1.1 2.24 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.24 2 5 2s5-.9 5-2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    target: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="8" r=".8" fill="currentColor" />
      </svg>
    ),
    frontend: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2 6h12" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    backend: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="3" rx=".8" stroke="currentColor" strokeWidth="1.2" />
        <rect x="2" y="8" width="12" height="3" rx=".8" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="4.5" cy="4.5" r=".5" fill="currentColor" />
        <circle cx="4.5" cy="9.5" r=".5" fill="currentColor" />
      </svg>
    ),
    db: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <ellipse cx="8" cy="4" rx="5" ry="1.6" stroke="currentColor" strokeWidth="1.2" />
        <path d="M3 4v8c0 .9 2.24 1.6 5 1.6s5-.7 5-1.6V4" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    lock: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="7" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    cloud: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M4 12a3 3 0 010-6 4 4 0 017.5-1 3 3 0 01.5 6H4z" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    train: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M2 13l3-3 2 2 4-4 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };

  return (
    <div>
      {/* Top metrics */}
      {isModel && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
          <MetricCard label="Algorithm" value={s.algorithm?.split(" ").slice(0, 3).join(" ") || "—"} sub={s.algorithm} />
          <MetricCard label="Accuracy" value={(s.accuracy || "—").split(" ·")[0]} sub={s.accuracy} tone="accent" />
          <MetricCard label="Dataset" value={(s.dataset || "—").split(" ·")[0]} sub={s.dataset} />
        </div>
      )}
      {!isModel && (s.kind === "web" || s.kind === "mob") && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
          <MetricCard label="Platform" value={s.kind === "web" ? "Web" : "Mobile"} sub={s.kind === "web" ? "Responsive, PWA-ready" : "iOS + Android"} />
          <MetricCard label="Architecture" value={s.kind === "web" ? "Full-stack" : "Cross-platform"} sub={p.stack.join(" · ")} tone="accent" />
          <MetricCard label="Auth" value={(s.auth && s.auth[0]) || "JWT"} sub={s.auth ? s.auth.join(" · ") : "Standard auth flow"} />
        </div>
      )}

      {/* Architecture rows */}
      <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "4px 20px" }}>
        {isModel && (
          <>
            {s.algorithm && <Row icon={ic.brain} label="Algorithm" items={[s.algorithm]} tone="accent" />}
            {s.training && <Row icon={ic.train} label="Training" items={[s.training]} />}
            {s.dataset && <Row icon={ic.data} label="Dataset" items={[s.dataset]} />}
            {s.accuracy && <Row icon={ic.target} label="Accuracy" items={s.accuracy.split(" · ")} />}
          </>
        )}
        {s.model && <Row icon={ic.brain} label="Model" items={[s.model]} tone="accent" />}
        {s.frontend && <Row icon={ic.frontend} label="Frontend" items={s.frontend} />}
        {s.backend && <Row icon={ic.backend} label="Backend" items={s.backend} />}
        {s.db && <Row icon={ic.db} label="Database" items={s.db} />}
        {s.auth && <Row icon={ic.lock} label="Auth" items={s.auth} />}
        {s.deploy && (
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 20, padding: "16px 0", alignItems: "start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--paper-2)", display: "grid", placeItems: "center" }}>
                {ic.cloud}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Deploy</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {s.deploy.map((x: string, i: number) => (
                <Pill key={i}>{x}</Pill>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AbstractPanel({ p }: { p: any }) {
  const ab = p.abstract || {
    objective: p.description,
    methodology: "Detailed methodology available in the full report included with purchase.",
    results: "Results documented in the final report.",
    keywords: p.stack.join(", "),
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const M = 54;
    let y = 70;
    // header bar
    doc.setFillColor(10, 15, 44);
    doc.rect(0, 0, W, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PROJECT HOUSE  //  ABSTRACT", M, 25);
    doc.setTextColor(10, 15, 44);

    doc.setFont("times", "italic");
    doc.setFontSize(10);
    const catLabel = CATEGORIES.find((c) => c.id === p.cat)?.label.toUpperCase() || "";
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

    // footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 96, 120);
    doc.text("projecthouse.dev  ·  " + p.id + "  ·  one-page abstract", M, doc.internal.pageSize.getHeight() - 30);

    doc.save(p.id + "-abstract.pdf");
  };

  const downloadDOCX = async () => {
    const zip = new JSZip();
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const para = (text: string, { bold = false, size = 22, color = "0A0F2C", italic = false, spaceAfter = 160 } = {}) => `
<w:p><w:pPr><w:spacing w:after="${spaceAfter}"/></w:pPr><w:r><w:rPr>${bold ? "<w:b/>" : ""}${italic ? "<w:i/>" : ""}<w:sz w:val="${size}"/><w:color w:val="${color}"/><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`;
    const heading = (t: string) => para(t, { bold: true, size: 18, color: "5A6078", spaceAfter: 80 });

    const catLabel = CATEGORIES.find((c) => c.id === p.cat)?.label.toUpperCase() || "";
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

  const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
        {label}
      </div>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: "var(--ink)" }}>{children}</p>
    </div>
  );

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
            flex: 1,
            minWidth: 200,
            padding: "14px 18px",
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "var(--card)",
            color: "var(--ink)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ width: 36, height: 36, borderRadius: 8, background: "#E03E3E", color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700 }}>
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
            flex: 1,
            minWidth: 200,
            padding: "14px 18px",
            borderRadius: 12,
            border: "1px solid var(--line)",
            background: "var(--card)",
            color: "var(--ink)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 14,
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ width: 36, height: 36, borderRadius: 8, background: "#2B579A", color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700 }}>
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

const Stat = ({ n, l }: { n: number | string; l: string }) => (
  <div style={{ padding: "14px 16px", background: "var(--card)", border: "1px solid var(--line)", borderRadius: 10 }}>
    <div className="serif" style={{ fontSize: 32, lineHeight: 1, letterSpacing: "-.02em" }}>
      {n}
    </div>
    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{l}</div>
  </div>
);

export function Drawer() {
  const { openedProject: project, setOpenedProject, accent } = useProjectHouse();
  const [tab, setTab] = useState("overview");
  const [demoOpen, setDemoOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{ paymentId: string; amount: number } | null>(null);
  const [sel, setSel] = useState<Record<number, boolean>>({});
  const isMobile = useIsMobile();

  const p_includes: { name: string; price: number }[] = (project as any)?.includes ?? [];
  const toggleAddon = (idx: number) => {
    if (p_includes[idx]?.price === 0) return;
    setSel((s) => ({ ...s, [idx]: s[idx] !== false ? false : true }));
  };
  const customTotal = p_includes.reduce((sum, item, idx) => sel[idx] !== false ? sum + item.price : sum, 0);
  const fullTotal = p_includes.reduce((sum, item) => sum + item.price, 0);
  const selCount = p_includes.filter((item, idx) => item.price > 0 && sel[idx] !== false).length;

  useEffect(() => {
    if (!project) {
      setDemoOpen(false);
      setSel({});
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedProject(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [project, setOpenedProject]);

  if (!project) return null;
  const p = project;
  const cat = CATEGORIES.find((c) => c.id === p.cat);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
      <div
        onClick={() => setOpenedProject(null)}
        style={{ position: "absolute", inset: 0, background: "#0A0F2C80", backdropFilter: "blur(4px)", animation: "fadein .2s" }}
      />
      <aside
        className="scroll"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "min(720px, 94vw)",
          background: "var(--paper)",
          overflowY: "auto",
          animation: "slidein .28s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <div
          style={{
            padding: isMobile ? "14px 16px" : "22px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--line)",
            position: "sticky",
            top: 0,
            background: "var(--paper)",
            zIndex: 2,
          }}
        >
          <div className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".15em", textTransform: "uppercase" }}>
            Project · {cat?.label}
          </div>
          <button
            onClick={() => setOpenedProject(null)}
            aria-label="Close"
            style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", fontSize: 18, color: "var(--ink)" }}
          >
            ×
          </button>
        </div>

        {(() => {
          const extractYouTubeID = (url?: string) => {
            if (!url) return null;
            const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[7].length === 11) ? match[7] : null;
          };
          
          const youtubeID = extractYouTubeID(p.youtube_link) || "XHTrLYShBRQ"; // Fallback demo video if link is missing

          return (
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}></div>
              <iframe
                className="w-full h-full object-cover object-center"
                src={`https://www.youtube.com/embed/${youtubeID}?autoplay=1&mute=1&loop=1&playlist=${youtubeID}`}
                style={{ zIndex: 10, width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          );
        })()}

        <div style={{ padding: isMobile ? "16px" : "32px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <span className="mono" style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "var(--paper-2)", color: "var(--muted)" }}>
              {p.level}
            </span>
            <span className="mono" style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "var(--paper-2)", color: "var(--muted)" }}>
              {p.tag}
            </span>
            <span className="mono" style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "var(--paper-2)", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Star /> {p.rating.toFixed(1)} · {p.downloads.toLocaleString()}
            </span>
          </div>
          <h2 className="serif" style={{ fontSize: isMobile ? 30 : 48, lineHeight: 1.02, margin: 0, letterSpacing: "-.02em" }}>
            {p.title}
          </h2>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.6, marginTop: 14 }}>{p.description}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 24 }}>
            <Stat n={p.files} l="files" />
            <Stat n={p.pages} l="pages, report" />
            <Stat n={p.stack.length} l="tech in stack" />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 28, borderBottom: "1px solid var(--line)" }}>
            {[
              ["overview", "What you get"],
              ["abstract", "Abstract"],
              ["stack", "Tech stack"],
              ["timeline", "Timeline"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  padding: "12px 4px",
                  marginRight: 20,
                  background: "transparent",
                  border: "none",
                  borderBottom: tab === id ? "2px solid var(--ink)" : "2px solid transparent",
                  color: tab === id ? "var(--ink)" : "var(--muted)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 24, minHeight: 220 }}>
            {tab === "overview" && (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                {(p.includes ?? []).map((item: { name: string; price: number }, i: number) => {
                  const checked = sel[i] !== false;
                  return (
                    <li
                      key={i}
                      onClick={() => toggleAddon(i)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, fontSize: 14,
                        padding: "14px 16px", background: checked ? "var(--card)" : "var(--paper-2)",
                        border: `1px solid ${checked ? "var(--ink)" : "var(--line)"}`, borderRadius: 10,
                        cursor: item.price === 0 ? "default" : "pointer", opacity: checked ? 1 : 0.5,
                        transition: "opacity .15s, border-color .15s, background .15s",
                      }}
                    >
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: checked ? accent : "var(--line)",
                        display: "grid", placeItems: "center", flexShrink: 0,
                        transition: "background .15s",
                      }}>
                        {checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span style={{ flex: 1 }}>{item.name}</span>
                      <span style={{ fontSize: 12, color: "var(--muted)", flexShrink: 0 }}>
                        {item.price > 0 ? `₹${item.price.toLocaleString("en-IN")}` : "Bundled"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {tab === "abstract" && <AbstractPanel p={p} />}
            {tab === "stack" && <StackPanel p={p} accent={accent} />}
            {tab === "timeline" && (
              <ol style={{ listStyle: "none", padding: 0, margin: 0, position: "relative" }}>
                <div style={{ position: "absolute", left: 11, top: 10, bottom: 10, width: 2, background: "var(--line)" }} />
                {[
                  ["Day 1", "Download, unzip, run setup script"],
                  ["Day 2", "Walk through the report + notebooks"],
                  ["Day 3–5", "Customise dataset / tune for your use case"],
                  ["Day 6", "Deploy demo, record walkthrough"],
                  ["Day 7", "Viva prep — we answer your questions"],
                ].map(([d, t], i) => (
                  <li key={i} style={{ display: "flex", gap: 16, padding: "10px 0", position: "relative" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: i < 2 ? accent : "var(--card)", border: "1px solid var(--line)", display: "grid", placeItems: "center", flexShrink: 0, zIndex: 1 }}>
                      <span className="mono" style={{ fontSize: 10 }}>{i + 1}</span>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".12em", textTransform: "uppercase" }}>
                        {d}
                      </div>
                      <div style={{ fontSize: 14, marginTop: 2 }}>{t}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "var(--paper)",
            borderTop: "1px solid var(--line)",
            padding: isMobile ? "14px 16px" : "18px 32px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".12em" }}>
                Your total
              </div>
              {customTotal !== fullTotal && fullTotal > 0 && (
                <span style={{ fontSize: 11, color: "var(--muted)", textDecoration: "line-through" }}>
                  ₹{fullTotal.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-.02em", lineHeight: 1.1 }}>
              ₹{(customTotal || p.price).toLocaleString("en-IN")}
              {selCount > 0 && <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}> · {selCount} item{selCount !== 1 ? "s" : ""}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setDemoOpen(true)}
              style={{ padding: "14px 18px", borderRadius: 999, border: "1px solid var(--line)", background: "transparent", fontFamily: "inherit", fontSize: 14, cursor: "pointer", color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 2l9 5-9 5V2z" fill="currentColor" />
              </svg>
              {p.cat === "mob" ? "Get demo APK" : "Book 1-hour demo"}
            </button>
            <RazorpayButton
              amount={(customTotal || (p as any).price) * 100}
              name="Project House"
              description={(p as any).title}
              onSuccess={(paymentId) => {
                setPaymentSuccess({ paymentId, amount: (customTotal || (p as any).price) * 100 });
              }}
              onFailure={(err) => alert(`Payment failed: ${(err as any)?.description ?? "Unknown error"}`)}
              style={{ padding: "14px 22px", borderRadius: 999, border: "none", background: "var(--ink)", color: "var(--paper)", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", gap: 8, alignItems: "center" }}
            >
              Get this project <ArrowUpRight />
            </RazorpayButton>
          </div>
        </div>
      </aside>
      {demoOpen && <DemoModal project={p} onClose={() => setDemoOpen(false)} accent={accent} />}
      {paymentSuccess && (
        <PaymentSuccessModal
          projectTitle={(p as any).title}
          paymentId={paymentSuccess.paymentId}
          amount={paymentSuccess.amount}
          accent={accent}
          onClose={() => { setPaymentSuccess(null); setOpenedProject(null); }}
        />
      )}
    </div>
  );
}
