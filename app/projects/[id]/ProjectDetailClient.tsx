"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/data";

const TABS = [
  { id: "overview",    label: "What you get" },
  { id: "abstract",   label: "Abstract" },
  { id: "stack",      label: "Tech stack" },
  { id: "timeline",   label: "Timeline" },
  { id: "source",     label: "Source code" },
];

const TIMELINE = [
  ["Day 1",   "Download, unzip, run setup script"],
  ["Day 2",   "Walk through the report + notebooks"],
  ["Day 3–5", "Customise dataset / tune for your use case"],
  ["Day 6",   "Deploy demo, record walkthrough"],
  ["Day 7",   "Viva prep — we answer your questions"],
];

function Pill({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="mono"
      style={{
        fontSize: 11, padding: "5px 12px", borderRadius: 999,
        background: color ? color + "22" : "var(--card)",
        color: color ?? "var(--muted)",
        border: `1px solid ${color ? color + "44" : "var(--line)"}`,
        letterSpacing: ".04em",
      }}
    >
      {children}
    </span>
  );
}

function Stat({ n, l }: { n: number | string; l: string }) {
  return (
    <div style={{ padding: "16px 20px", background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12 }}>
      <div className="serif" style={{ fontSize: 36, lineHeight: 1, letterSpacing: "-.02em" }}>{n}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{l}</div>
    </div>
  );
}

function FileTree({ project }: { project: any }) {
  const rootName = project.id ?? "project";
  const files: { name: string; type: "file" | "folder"; children?: { name: string }[] }[] = [
    {
      name: "src/", type: "folder",
      children: [
        { name: "main.py" },
        { name: "model.py" },
        { name: "utils.py" },
        { name: "config.py" },
      ],
    },
    {
      name: "notebooks/", type: "folder",
      children: [
        { name: "01_eda.ipynb" },
        { name: "02_training.ipynb" },
        { name: "03_evaluation.ipynb" },
      ],
    },
    {
      name: "data/", type: "folder",
      children: [
        { name: "README.md" },
        { name: "sample.csv" },
      ],
    },
    {
      name: "report/", type: "folder",
      children: [
        { name: `${rootName}-report.pdf` },
        { name: `${rootName}-abstract.docx` },
      ],
    },
    { name: "requirements.txt", type: "file" },
    { name: "setup.sh", type: "file" },
    { name: "README.md", type: "file" },
  ];

  return (
    <div
      className="mono"
      style={{
        background: "var(--card)", border: "1px solid var(--line)",
        borderRadius: 12, padding: "20px 24px", fontSize: 13,
        lineHeight: 1.8,
      }}
    >
      <div style={{ color: "var(--muted)", marginBottom: 8, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>
        {rootName}/
      </div>
      {files.map((entry) =>
        entry.type === "folder" ? (
          <div key={entry.name}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink)" }}>
              <span style={{ color: "var(--muted)" }}>📁</span> {entry.name}
            </div>
            {entry.children?.map((child) => (
              <div key={child.name} style={{ paddingLeft: 24, display: "flex", alignItems: "center", gap: 8, color: "var(--muted)" }}>
                <span>📄</span> {child.name}
              </div>
            ))}
          </div>
        ) : (
          <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)" }}>
            <span>📄</span> {entry.name}
          </div>
        )
      )}
    </div>
  );
}

export default function ProjectDetailClient({
  project: p,
  payment,
}: {
  project: any;
  payment: { id: string; created_at: string; amount: number; razorpay_payment_id: string };
}) {
  const [tab, setTab] = useState("overview");
  const cat = CATEGORIES.find((c) => c.id === p.cat);
  const ab = p.abstract || { objective: p.description, methodology: "", results: "", keywords: p.stack?.join(", ") ?? "" };
  const paidDate = new Date(payment.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const extractYouTubeID = (url?: string) => {
    if (!url) return null;
    const m = url.match(/^.*((youtu\.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);
    return m && m[7].length === 11 ? m[7] : null;
  };
  const youtubeID = extractYouTubeID(p.youtube_link);

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>

      {/* Top nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "var(--paper)", borderBottom: "1px solid var(--line)",
        padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/my-projects" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>
            ← My Projects
          </a>
          <span style={{ color: "var(--line)" }}>/</span>
          <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {p.title}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            className="mono"
            style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "#D1FAE5", color: "#065F46", border: "1px solid #6EE7B7", fontWeight: 500 }}
          >
            Purchased {paidDate}
          </span>
        </div>
      </div>

      {/* Hero video */}
      {youtubeID && (
        <div style={{ width: "100%", aspectRatio: "16/9", maxHeight: 480, background: "#000", overflow: "hidden" }}>
          <iframe
            src={`https://www.youtube.com/embed/${youtubeID}?autoplay=1&mute=1&loop=1&playlist=${youtubeID}`}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Color band if no video */}
      {!youtubeID && (
        <div style={{ height: 8, background: p.color ?? "#2A2FB8" }} />
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Meta badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <Pill color={p.color}>{cat?.label ?? p.cat}</Pill>
          <Pill>{p.level}</Pill>
          <Pill>{p.tag}</Pill>
          <Pill>★ {p.rating?.toFixed(1)}</Pill>
        </div>

        {/* Title */}
        <h1 className="serif" style={{ fontSize: "clamp(32px,5vw,64px)", margin: "0 0 16px", lineHeight: 1.02, letterSpacing: "-.02em" }}>
          {p.title}
        </h1>
        <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.65, margin: "0 0 32px", maxWidth: 680 }}>
          {p.description}
        </p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 40 }}>
          <Stat n={p.files} l="source files" />
          <Stat n={p.pages} l="pages, report" />
          <Stat n={p.stack?.length ?? 0} l="tech in stack" />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--line)", marginBottom: 32, overflowX: "auto" }}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: "12px 20px", background: "transparent", border: "none",
                borderBottom: tab === id ? "2px solid var(--ink)" : "2px solid transparent",
                color: tab === id ? "var(--ink)" : "var(--muted)",
                cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 500,
                whiteSpace: "nowrap",
                ...(id === "source" ? {
                  color: tab === id ? "var(--ink)" : "#10B981",
                  fontWeight: 600,
                } : {}),
              }}
            >
              {label}
              {id === "source" && (
                <span style={{ marginLeft: 6, fontSize: 10, padding: "2px 6px", borderRadius: 999, background: "#D1FAE5", color: "#065F46", verticalAlign: "middle" }}>
                  NEW
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ minHeight: 300 }}>

          {/* Overview */}
          {tab === "overview" && (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {(p.includes ?? []).map((item: { name: string; price: number }, i: number) => (
                <li
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, fontSize: 14,
                    padding: "14px 16px", background: "var(--card)",
                    border: "1px solid var(--line)", borderRadius: 10,
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: p.color ?? "var(--ink)",
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    {item.price > 0 ? `₹${item.price.toLocaleString("en-IN")}` : "Included"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Abstract */}
          {tab === "abstract" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {[
                ["Objective", ab.objective],
                ["Methodology", ab.methodology],
                ["Results", ab.results],
              ].filter(([, v]) => v).map(([heading, body]) => (
                <div key={heading as string}>
                  <h3 className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".14em", textTransform: "uppercase", margin: "0 0 10px" }}>
                    {heading}
                  </h3>
                  <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0, color: "var(--ink)" }}>{body}</p>
                </div>
              ))}
              {ab.keywords && (
                <div>
                  <h3 className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".14em", textTransform: "uppercase", margin: "0 0 10px" }}>
                    Keywords
                  </h3>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {ab.keywords.split(",").map((kw: string) => (
                      <Pill key={kw}>{kw.trim()}</Pill>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tech stack */}
          {tab === "stack" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {p.stack_detail?.layers ? (
                p.stack_detail.layers.map((layer: { name: string; items: string[] }) => (
                  <div key={layer.name}>
                    <div className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 10 }}>
                      {layer.name}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {layer.items.map((item: string) => <Pill key={item} color={p.color}>{item}</Pill>)}
                    </div>
                  </div>
                ))
              ) : (
                <div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 12 }}>
                    Full stack
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(p.stack ?? []).map((s: string) => <Pill key={s} color={p.color}>{s}</Pill>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          {tab === "timeline" && (
            <ol style={{ listStyle: "none", padding: 0, margin: 0, position: "relative" }}>
              <div style={{ position: "absolute", left: 11, top: 10, bottom: 10, width: 2, background: "var(--line)" }} />
              {TIMELINE.map(([day, task], i) => (
                <li key={i} style={{ display: "flex", gap: 18, padding: "12px 0", position: "relative" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: i < 2 ? (p.color ?? "var(--ink)") : "var(--card)",
                    border: "1px solid var(--line)", display: "grid", placeItems: "center",
                    flexShrink: 0, zIndex: 1,
                  }}>
                    <span className="mono" style={{ fontSize: 10, color: i < 2 ? "#fff" : "var(--muted)" }}>{i + 1}</span>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".12em", textTransform: "uppercase" }}>{day}</div>
                    <div style={{ fontSize: 15, marginTop: 4 }}>{task}</div>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {/* Source code */}
          {tab === "source" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

              {/* Download CTA */}
              <div style={{
                padding: "24px 28px", borderRadius: 16,
                background: (p.color ?? "#2A2FB8") + "12",
                border: `1px solid ${(p.color ?? "#2A2FB8")}33`,
                display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
              }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Download source package</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>
                    {p.files} files · includes all notebooks, datasets, and report
                  </div>
                </div>
                <button
                  style={{
                    padding: "12px 24px", borderRadius: 999, border: "none",
                    background: p.color ?? "var(--ink)", color: "#fff",
                    fontFamily: "inherit", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 8,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v8m0 0L5 7m3 3 3-3M2 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Download ZIP
                </button>
              </div>

              {/* File tree */}
              <div>
                <h3 className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".14em", textTransform: "uppercase", margin: "0 0 12px" }}>
                  File structure
                </h3>
                <FileTree project={p} />
              </div>

              {/* Stack versions */}
              <div>
                <h3 className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".14em", textTransform: "uppercase", margin: "0 0 12px" }}>
                  Setup
                </h3>
                <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: "20px 24px" }}>
                  <div className="mono" style={{ fontSize: 13, lineHeight: 2, color: "var(--ink)" }}>
                    <div><span style={{ color: "var(--muted)" }}># Clone / extract and install</span></div>
                    <div>cd {p.id}</div>
                    <div>pip install -r requirements.txt</div>
                    <div>bash setup.sh</div>
                  </div>
                </div>
              </div>

              {/* Payment receipt */}
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 24 }}>
                <h3 className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".14em", textTransform: "uppercase", margin: "0 0 12px" }}>
                  Purchase receipt
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 13 }}>
                  <div>
                    <div style={{ color: "var(--muted)", marginBottom: 2 }}>Payment ID</div>
                    <div className="mono">{payment.razorpay_payment_id}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--muted)", marginBottom: 2 }}>Amount paid</div>
                    <div style={{ fontWeight: 600 }}>₹{(payment.amount / 100).toLocaleString("en-IN")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--muted)", marginBottom: 2 }}>Date</div>
                    <div>{paidDate}</div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
