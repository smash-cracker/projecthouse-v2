"use client";

import React, { useState, useRef, useEffect } from "react";
import { CATEGORIES } from "@/lib/data";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useProjectHouse } from "@/components/providers/ThemeProvider";
import { AbstractPanel, StackPanel } from "@/components/features/ProjectPanels";

const PUBLIC_TABS = [
  { id: "overview",  label: "What you get" },
  { id: "abstract",  label: "Abstract" },
  { id: "stack",     label: "Tech stack" },
  { id: "timeline",  label: "Timeline" },
];

const GATED_TABS = [
  { id: "source",   label: "Source code" },
  { id: "ask-ai",   label: "Ask AI" },
];

const TABS = [...PUBLIC_TABS, ...GATED_TABS];

const TIMELINE = [
  ["Day 1",   "Download, unzip, run setup script"],
  ["Day 2",   "Walk through the report + notebooks"],
  ["Day 3–5", "Customise dataset / tune for your use case"],
  ["Day 6",   "Deploy demo, record walkthrough"],
  ["Day 7",   "Viva prep — we answer your questions"],
];

// ——— Ask AI sub-components ———————————————————————————————————

type Message = { role: "user" | "assistant"; content: string };

const AI_SUGGESTIONS = [
  "Explain the methodology used in this project",
  "What viva questions should I prepare for?",
  "How does the main algorithm work?",
  "What are the key results and how do I defend them?",
  "How can I extend this project further?",
];

function BotText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <React.Fragment key={li}>
            {parts.map((part, pi) => {
              if (part.startsWith("**") && part.endsWith("**"))
                return <strong key={pi}>{part.slice(2, -2)}</strong>;
              if (part.startsWith("`") && part.endsWith("`"))
                return (
                  <code key={pi} style={{
                    fontFamily: "JetBrains Mono, monospace", fontSize: "0.88em",
                    background: "var(--paper)", borderRadius: 4, padding: "1px 5px",
                  }}>{part.slice(1, -1)}</code>
                );
              return <React.Fragment key={pi}>{part}</React.Fragment>;
            })}
            {li < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
}

const BotAvatar = ({ accent }: { accent: string }) => (
  <div style={{
    width: 32, height: 32, borderRadius: 10, background: accent,
    display: "grid", placeItems: "center", flexShrink: 0,
  }}>
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="6" width="14" height="10" rx="3" fill="#fff" opacity=".2" stroke="#fff" strokeWidth="1.4"/>
      <circle cx="7.5" cy="11" r="1.2" fill="#fff"/>
      <circle cx="12.5" cy="11" r="1.2" fill="#fff"/>
      <path d="M7 6V4.5a3 3 0 016 0V6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  </div>
);

const UserAvatar = () => (
  <div style={{
    width: 32, height: 32, borderRadius: 10, background: "var(--ink)",
    display: "grid", placeItems: "center", flexShrink: 0,
  }}>
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3.2" fill="var(--paper)" opacity=".9"/>
      <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="var(--paper)" strokeWidth="1.4" strokeLinecap="round" opacity=".9"/>
    </svg>
  </div>
);

const TypingDots = () => (
  <span style={{ display: "inline-flex", gap: 5, alignItems: "center", padding: "2px 0" }}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: "50%", background: "var(--muted)",
        display: "inline-block",
        animation: `chatDot 1.2s ${i * 0.2}s ease-in-out infinite`,
      }} />
    ))}
  </span>
);

function ChatPanel({ accent, projectTitle, projectDescription }: { accent: string; projectTitle: string; projectDescription: string }) {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const contextPrefix = messages.length === 0
      ? `[Project: "${projectTitle}" — ${projectDescription}]\n\n`
      : "";
    const userMsg: Message = { role: "user", content: contextPrefix + trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk.startsWith("__ERROR__:")) {
          assistantText = "Sorry, I couldn't reach the AI. Please try again shortly.";
          break;
        }
        assistantText += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: assistantText || "Sorry, I couldn't reach the AI. Please try again shortly." };
        return updated;
      });
    } catch {
      setLoading(false);
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 560, border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
      <div
        className="scroll"
        style={{
          flex: 1, overflowY: "auto",
          padding: isEmpty ? "0" : isMobile ? "16px 12px 8px" : "24px 28px 12px",
          display: "flex", flexDirection: "column", gap: 24,
        }}
      >
        {isEmpty && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", gap: 20,
            padding: isMobile ? "20px 16px" : "28px 24px",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, background: accent,
              display: "grid", placeItems: "center", boxShadow: `0 8px 24px ${accent}55`,
            }}>
              <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="6" width="14" height="10" rx="3" fill="#fff" opacity=".2" stroke="#fff" strokeWidth="1.4"/>
                <circle cx="7.5" cy="11" r="1.4" fill="#fff"/>
                <circle cx="12.5" cy="11" r="1.4" fill="#fff"/>
                <path d="M7 6V4.5a3 3 0 016 0V6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.01em" }}>Project Bot</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, lineHeight: 1.6, maxWidth: 320 }}>
                Ask me anything about this project — methodology, results, or how to handle tough viva questions.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: isMobile ? "100%" : 400 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 2 }}>
                Try asking
              </div>
              {AI_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    padding: "11px 16px", borderRadius: 10,
                    border: "1px solid var(--line)", background: "var(--card)",
                    color: "var(--ink)", fontFamily: "inherit", fontSize: 13,
                    cursor: "pointer", textAlign: "left", display: "flex",
                    alignItems: "center", justifyContent: "space-between", gap: 8,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; }}
                >
                  {s}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, color: "var(--muted)" }}>
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          const displayContent = isUser
            ? msg.content.replace(/^\[Project:[^\]]+\]\n\n/, "")
            : msg.content;
          const isStreaming = !isUser && i === messages.length - 1 && msg.content === "" && loading;
          return (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: isUser ? "row-reverse" : "row" }}>
              {isUser ? <UserAvatar /> : <BotAvatar accent={accent} />}
              <div style={{ maxWidth: isMobile ? "88%" : "75%", display: "flex", flexDirection: "column", gap: 4, alignItems: isUser ? "flex-end" : "flex-start" }}>
                <div className="mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase", paddingInline: 4 }}>
                  {isUser ? "You" : "Project Bot"}
                </div>
                <div style={{
                  padding: "13px 17px",
                  borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  background: isUser ? "var(--ink)" : "var(--card)",
                  color: isUser ? "var(--paper)" : "var(--ink)",
                  border: isUser ? "none" : "1px solid var(--line)",
                  fontSize: 14, lineHeight: 1.7,
                  boxShadow: isUser ? "0 2px 8px rgba(0,0,0,.12)" : "0 1px 4px rgba(0,0,0,.06)",
                }}>
                  {isStreaming
                    ? <TypingDots />
                    : isUser
                      ? <span style={{ whiteSpace: "pre-wrap" }}>{displayContent}</span>
                      : <BotText text={displayContent} />
                  }
                </div>
              </div>
            </div>
          );
        })}

        {loading && messages[messages.length - 1]?.role === "user" && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <BotAvatar accent={accent} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase", paddingInline: 4 }}>Project Bot</div>
              <div style={{ padding: "13px 17px", borderRadius: "4px 16px 16px 16px", background: "var(--card)", border: "1px solid var(--line)", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
                <TypingDots />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ borderTop: "1px solid var(--line)", padding: isMobile ? "10px 12px" : "14px 20px", background: "var(--paper)" }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "flex-end",
          background: "var(--card)", border: "1px solid var(--line)",
          borderRadius: 14, padding: "8px 8px 8px 16px",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about your project or viva prep…"
            rows={1}
            style={{
              flex: 1, resize: "none", border: "none", outline: "none",
              background: "transparent", color: "var(--ink)",
              fontSize: 14, fontFamily: "inherit", lineHeight: 1.55,
              maxHeight: 120, overflowY: "auto", padding: "4px 0",
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            style={{
              width: 36, height: 36, borderRadius: 9, border: "none", flexShrink: 0,
              background: input.trim() && !loading ? accent : "var(--line)",
              color: input.trim() && !loading ? "#fff" : "var(--muted)",
              cursor: input.trim() && !loading ? "pointer" : "default",
              display: "grid", placeItems: "center",
              transition: "background .15s, color .15s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {!isMobile && (
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 7, paddingInline: 4 }}>
            Enter to send · Shift+Enter for new line
          </div>
        )}
      </div>

      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

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

function PurchaseGate({ accent, projectId }: { accent: string; projectId: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", textAlign: "center",
      padding: "56px 24px", gap: 20,
      border: "1px dashed var(--line)", borderRadius: 16,
      background: "var(--card)",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: "var(--line)",
        display: "grid", placeItems: "center",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="11" width="18" height="11" rx="3" stroke="var(--muted)" strokeWidth="1.8"/>
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Purchase required</div>
        <div style={{ fontSize: 14, color: "var(--muted)", maxWidth: 340, lineHeight: 1.65 }}>
          Source code and AI chat are available exclusively to buyers of this project.
        </div>
      </div>
      <a
        href={`/#pricing`}
        style={{
          padding: "12px 28px", borderRadius: 999, border: "none",
          background: accent, color: "var(--accent-ink)",
          fontFamily: "inherit", fontSize: 14, fontWeight: 700,
          cursor: "pointer", textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 8,
        }}
      >
        Get this project
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>
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
  payment: { id: string; created_at: string; amount: number; razorpay_payment_id: string } | null;
}) {
  const { accent } = useProjectHouse();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("overview");
  const cat = CATEGORIES.find((c) => c.id === p.cat);
  const ab = p.abstract || { objective: p.description, methodology: "", results: "", keywords: p.stack?.join(", ") ?? "" };
  const hasPurchased = payment !== null;
  const paidDate = payment
    ? new Date(payment.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const extractYouTubeID = (url?: string) => {
    if (!url) return null;
    const m = url.match(/^.*((youtu\.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);
    return m && m[7].length === 11 ? m[7] : null;
  };
  const youtubeID = extractYouTubeID(p.youtube_link);

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>

      {/* Header — matches viva page style */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "var(--card)", borderBottom: "1px solid var(--line)",
        padding: isMobile ? "0 16px" : "0 28px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        height: 64, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            href="/my-projects"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 34, height: 34, borderRadius: 9,
              border: "1px solid var(--line)", background: "var(--paper-2)",
              textDecoration: "none", color: "var(--ink)", flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          {!isMobile && (
            <>
              <span style={{ color: "var(--line)", fontSize: 18 }}>/</span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>My Projects</span>
              <span style={{ color: "var(--line)", fontSize: 18 }}>/</span>
              <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.title}
              </span>
            </>
          )}
          {isMobile && (
            <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.title}
            </span>
          )}
        </div>
        {hasPurchased ? (
          <span
            className="mono"
            style={{
              fontSize: 11, padding: "5px 12px", borderRadius: 999,
              background: accent + "22", color: accent,
              border: `1px solid ${accent}44`, fontWeight: 600,
              flexShrink: 0,
            }}
          >
            ✓ Purchased
          </span>
        ) : (
          <a
            href="/#pricing"
            style={{
              fontSize: 11, padding: "5px 14px", borderRadius: 999,
              background: accent, color: "var(--accent-ink)",
              border: "none", fontWeight: 700,
              flexShrink: 0, textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Get access
          </a>
        )}
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

      {/* Color band — taller gradient when no video */}
      {!youtubeID && (
        <div style={{
          height: 6,
          background: `linear-gradient(90deg, ${p.color ?? "var(--indigo)"}, ${accent})`,
        }} />
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "28px 16px 64px" : "40px 24px 80px" }}>

        {/* Meta badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <Pill color={p.color}>{cat?.label ?? p.cat}</Pill>
          <Pill>{p.level}</Pill>
          <Pill>{p.tag}</Pill>
          <Pill>★ {p.rating?.toFixed(1)}</Pill>
        </div>

        {/* Title */}
        <h1 className="serif" style={{ fontSize: isMobile ? "clamp(28px,8vw,42px)" : "clamp(32px,5vw,64px)", margin: "0 0 14px", lineHeight: 1.02, letterSpacing: "-.02em" }}>
          {p.title}
        </h1>
        <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.65, margin: "0 0 32px", maxWidth: 680 }}>
          {p.description}
        </p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 40 }}>
          {[
            { n: p.files, l: "source files" },
            { n: p.pages, l: "pages, report" },
            { n: p.stack?.length ?? 0, l: "tech in stack" },
          ].map(({ n, l }) => (
            <div key={l} style={{
              padding: isMobile ? "14px 16px" : "18px 22px",
              background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14,
              borderTop: `3px solid ${accent}`,
            }}>
              <div className="serif" style={{ fontSize: isMobile ? 28 : 36, lineHeight: 1, letterSpacing: "-.02em", color: "var(--ink)" }}>{n}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Tabs — pill style like viva mobile strip */}
        <div style={{
          display: "flex", gap: 6, marginBottom: 28, overflowX: "auto",
          padding: "0 0 2px",
        }}>
          {TABS.map(({ id, label }) => {
            const active = tab === id;
            const isGated = GATED_TABS.some((t) => t.id === id);
            const locked = isGated && !hasPurchased;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  padding: "8px 16px", borderRadius: 999, flexShrink: 0,
                  border: active ? "none" : "1px solid var(--line)",
                  background: active ? accent : "var(--card)",
                  color: active ? "var(--accent-ink)" : locked ? "var(--muted)" : "var(--muted)",
                  fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "background .15s, color .15s",
                  opacity: locked ? 0.6 : 1,
                } as React.CSSProperties}
              >
                {locked && <span style={{ marginRight: 5 }}>🔒</span>}
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ minHeight: 300 }}>

          {/* Overview */}
          {tab === "overview" && (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {(p.includes ?? []).map((item: { name: string; price: number }, i: number) => (
                <li
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, fontSize: 14,
                    padding: "13px 16px", background: "var(--card)",
                    border: "1px solid var(--line)", borderRadius: 12,
                    transition: "border-color .15s",
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: accent,
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          {tab === "abstract" && <AbstractPanel p={p} />}

          {tab === "stack" && <StackPanel p={p} accent={accent} />}

          {/* Timeline */}
          {tab === "timeline" && (
            <ol style={{ listStyle: "none", padding: 0, margin: 0, position: "relative" }}>
              <div style={{ position: "absolute", left: 11, top: 10, bottom: 10, width: 2, background: "var(--line)" }} />
              {TIMELINE.map(([day, task], i) => (
                <li key={i} style={{ display: "flex", gap: 18, padding: "12px 0", position: "relative" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: i < 2 ? accent : "var(--card)",
                    border: `1px solid ${i < 2 ? accent : "var(--line)"}`,
                    display: "grid", placeItems: "center",
                    flexShrink: 0, zIndex: 1,
                  }}>
                    <span className="mono" style={{ fontSize: 10, color: i < 2 ? "var(--accent-ink)" : "var(--muted)" }}>{i + 1}</span>
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
            hasPurchased ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Download CTA */}
                <div style={{
                  padding: "24px 28px", borderRadius: 16,
                  background: accent + "15",
                  border: `1px solid ${accent}33`,
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
                      padding: "11px 22px", borderRadius: 999, border: "none",
                      background: accent, color: "var(--accent-ink)",
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

                {/* Setup */}
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
                {payment && (
                  <div style={{
                    padding: "20px 24px", borderRadius: 14,
                    background: "var(--card)", border: "1px solid var(--line)",
                  }}>
                    <h3 className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".14em", textTransform: "uppercase", margin: "0 0 14px" }}>
                      Purchase receipt
                    </h3>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 13 }}>
                      <div>
                        <div style={{ color: "var(--muted)", marginBottom: 4, fontSize: 11 }}>Payment ID</div>
                        <div className="mono" style={{ fontSize: 12 }}>{payment.razorpay_payment_id}</div>
                      </div>
                      <div>
                        <div style={{ color: "var(--muted)", marginBottom: 4, fontSize: 11 }}>Amount paid</div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>₹{(payment.amount / 100).toLocaleString("en-IN")}</div>
                      </div>
                      <div>
                        <div style={{ color: "var(--muted)", marginBottom: 4, fontSize: 11 }}>Date</div>
                        <div>{paidDate}</div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <PurchaseGate accent={accent} projectId={p.id} />
            )
          )}

          {/* Ask AI */}
          {tab === "ask-ai" && (
            hasPurchased ? (
              <ChatPanel
                accent={accent}
                projectTitle={p.title}
                projectDescription={p.description}
              />
            ) : (
              <PurchaseGate accent={accent} projectId={p.id} />
            )
          )}

        </div>
      </div>
    </div>
  );
}
