"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { VIVA_TABS, VIVA_QA } from "@/lib/data";
import { useIsMobile } from "../../hooks/useIsMobile";

// ——— Chat panel ——————————————————————————————————————————

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I explain my model's accuracy to the panel?",
  "What is overfitting and how did you handle it?",
  "Explain bias-variance tradeoff simply",
  "How does backpropagation work?",
  "What questions are asked for MERN projects?",
];

// Renders **bold**, `code`, and newlines from bot text
function BotText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => {
        // split on **bold** and `code`
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
                    background: "var(--paper-2)", borderRadius: 4, padding: "1px 5px",
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
      <rect x="3" y="6" width="14" height="10" rx="3" fill="var(--accent-ink)" opacity=".15" stroke="var(--accent-ink)" strokeWidth="1.4"/>
      <circle cx="7.5" cy="11" r="1.2" fill="var(--accent-ink)"/>
      <circle cx="12.5" cy="11" r="1.2" fill="var(--accent-ink)"/>
      <path d="M7 6V4.5a3 3 0 016 0V6" stroke="var(--accent-ink)" strokeWidth="1.4" strokeLinecap="round"/>
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

function ChatPanel({ accent, isMobile }: { accent: string; isMobile: boolean }) {
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

    const userMsg: Message = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    // reset textarea height
    if (inputRef.current) { inputRef.current.style.height = "auto"; }
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }
    } catch {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Messages */}
      <div
        className="scroll"
        style={{
          flex: 1, overflowY: "auto", padding: isEmpty ? "0" : isMobile ? "16px 12px 8px" : "28px 32px 12px",
          display: "flex", flexDirection: "column", gap: 24,
        }}
      >
        {/* Empty state */}
        {isEmpty && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", gap: 20, padding: isMobile ? "20px 16px" : "32px",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, background: accent,
              display: "grid", placeItems: "center",
              boxShadow: `0 8px 24px ${accent}55`,
            }}>
              <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="6" width="14" height="10" rx="3" fill="var(--accent-ink)" opacity=".15" stroke="var(--accent-ink)" strokeWidth="1.4"/>
                <circle cx="7.5" cy="11" r="1.4" fill="var(--accent-ink)"/>
                <circle cx="12.5" cy="11" r="1.4" fill="var(--accent-ink)"/>
                <path d="M7 6V4.5a3 3 0 016 0V6" stroke="var(--accent-ink)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.01em" }}>Project Bot</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, lineHeight: 1.6, maxWidth: 320 }}>
                Ask me anything about your project — methodology, results, or how to handle tough viva questions.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: isMobile ? "100%" : 420 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 2 }}>
                Try asking
              </div>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    padding: "11px 16px", borderRadius: 10,
                    border: "1px solid var(--line)", background: "var(--card)",
                    color: "var(--ink)", fontFamily: "inherit", fontSize: 13,
                    cursor: "pointer", textAlign: "left", display: "flex",
                    alignItems: "center", justifyContent: "space-between", gap: 8,
                    transition: "border-color .15s",
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

        {/* Message list */}
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
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
                  fontSize: 14,
                  lineHeight: 1.7,
                  boxShadow: isUser ? "0 2px 8px rgba(0,0,0,.12)" : "0 1px 4px rgba(0,0,0,.06)",
                }}>
                  {isStreaming
                    ? <TypingDots />
                    : isUser
                      ? <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                      : <BotText text={msg.content} />
                  }
                </div>
              </div>
            </div>
          );
        })}

        {/* Standalone typing indicator while waiting for first token */}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <BotAvatar accent={accent} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase", paddingInline: 4 }}>Project Bot</div>
              <div style={{
                padding: "13px 17px", borderRadius: "4px 16px 16px 16px",
                background: "var(--card)", border: "1px solid var(--line)",
                boxShadow: "0 1px 4px rgba(0,0,0,.06)",
              }}>
                <TypingDots />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        borderTop: "1px solid var(--line)", padding: isMobile ? "10px 12px" : "14px 20px",
        background: "var(--paper)",
      }}>
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
              color: input.trim() && !loading ? "var(--accent-ink)" : "var(--muted)",
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

// ——— Main Viva Modal ——————————————————————————————————————

export function VivaModal() {
  const { vivaOpen, setVivaOpen, accent } = useProjectHouse();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("ml");
  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const switchTab = (id: string) => { setTab(id); setOpenIdx(null); setQuery(""); };

  useEffect(() => {
    if (!vivaOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setVivaOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [vivaOpen, setVivaOpen]);

  if (!vivaOpen) return null;

  const isBot = tab === "bot";
  const q = query.trim().toLowerCase();
  const allForTab = VIVA_QA[tab] || [];
  const items = q
    ? Object.values(VIVA_QA).flat().filter((item) =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      )
    : allForTab;
  const isSearching = q.length > 0;
  const totalCount = Object.values(VIVA_QA).reduce((s, arr) => s + arr.length, 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", flexDirection: "column", background: "var(--paper)" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--line)", padding: "0 28px", display: "flex", alignItems: "center", gap: 16, height: 64, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
          <span style={{ fontSize: 20 }}>🎓</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Viva Prep</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--muted)", background: "var(--card)", padding: "2px 8px", borderRadius: 6 }}>
            {totalCount} questions
          </span>
        </div>

        {/* Search — hidden in bot tab */}
        {!isBot && (
          <div style={{ flex: 1, maxWidth: 480, display: "flex", alignItems: "center", gap: 10, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 10, padding: "9px 14px" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: "var(--muted)" }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpenIdx(null); }}
              placeholder="Search all questions…"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--ink)", fontSize: 14, fontFamily: "inherit" }}
            />
            {query && (
              <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
            )}
          </div>
        )}

        <button
          onClick={() => setVivaOpen(false)}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "var(--ink)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Close <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>ESC</span>
        </button>
      </div>

      {/* Mobile horizontal tab strip */}
      {isMobile && (
        <div style={{ borderBottom: "1px solid var(--line)", overflowX: "auto", display: "flex", gap: 4, padding: "8px 12px", flexShrink: 0, whiteSpace: "nowrap" }}>
          {[...VIVA_TABS, { id: "bot", label: "Ask Bot", icon: "🤖" }].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                style={{
                  padding: "7px 12px", borderRadius: 999, border: "none", flexShrink: 0,
                  background: active ? accent : "var(--card)",
                  color: active ? "var(--accent-ink)" : "var(--ink)",
                  fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar — desktop only */}
        {!isMobile && (
        <div style={{ width: 220, borderRight: "1px solid var(--line)", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0, overflowY: "auto" }}>
          {VIVA_TABS.map((t) => {
            const active = tab === t.id;
            const count = (VIVA_QA[t.id] || []).length;
            return (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10, border: "none",
                  background: active ? accent : "transparent",
                  color: active ? "var(--accent-ink)" : "var(--ink)",
                  fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 9,
                  transition: "background .15s",
                }}
              >
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                <span style={{ flex: 1 }}>{t.label}</span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>{count}</span>
              </button>
            );
          })}

          {/* Divider */}
          <div style={{ height: 1, background: "var(--line)", margin: "8px 4px" }} />

          {/* Ask Project Bot */}
          <button
            onClick={() => switchTab("bot")}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 10, border: "none",
              background: tab === "bot" ? accent : "transparent",
              color: tab === "bot" ? "var(--accent-ink)" : "var(--ink)",
              fontFamily: "inherit", fontSize: 13, fontWeight: tab === "bot" ? 600 : 400,
              cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 9,
              transition: "background .15s",
            }}
          >
            <span style={{ fontSize: 16 }}>🤖</span>
            <span style={{ flex: 1 }}>Ask Project Bot</span>
            <span style={{
              fontSize: 9, padding: "2px 6px", borderRadius: 4,
              background: tab === "bot" ? "rgba(255,255,255,.25)" : accent,
              color: tab === "bot" ? "var(--accent-ink)" : "var(--accent-ink)",
              fontWeight: 600, letterSpacing: ".05em",
            }}>AI</span>
          </button>
        </div>
        )}

        {/* Content area */}
        {isBot ? (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ChatPanel accent={accent} isMobile={isMobile} />
          </div>
        ) : (
          <div className="scroll" style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "24px 32px" }}>
            {isSearching && (
              <div style={{ marginBottom: 20, fontSize: 13, color: "var(--muted)" }}>
                {items.length} result{items.length !== 1 ? "s" : ""} for <strong style={{ color: "var(--ink)" }}>"{query}"</strong>
              </div>
            )}

            {items.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>No questions match "{query}"</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Try different keywords or clear the search.</div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: "100%" }}>
              {items.map((item, i) => {
                const isOpen = openIdx === i;
                return (
                  <div
                    key={i}
                    style={{
                      border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden",
                      background: "var(--card)",
                      boxShadow: isOpen ? `0 0 0 2px ${accent}55` : "none",
                      transition: "box-shadow .15s",
                    }}
                  >
                    <button
                      onClick={() => setOpenIdx(isOpen ? null : i)}
                      style={{
                        width: "100%", padding: "16px 20px", display: "flex", alignItems: "center",
                        justifyContent: "space-between", gap: 16, background: "transparent", border: "none",
                        cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 500,
                        color: "var(--ink)", textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span className="mono" style={{
                          fontSize: 10,
                          background: isOpen ? accent : "var(--line)",
                          color: isOpen ? "var(--accent-ink)" : "var(--muted)",
                          padding: "2px 7px", borderRadius: 5, flexShrink: 0, transition: "all .15s",
                        }}>Q{i + 1}</span>
                        {item.q}
                      </div>
                      <span style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: isOpen ? accent : "var(--line)",
                        display: "grid", placeItems: "center", flexShrink: 0,
                        transition: "background .15s, transform .15s",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                      }}>
                        <svg width="9" height="9" viewBox="0 0 10 10">
                          <path d="M5 1v8M1 5h8" stroke={isOpen ? "var(--accent-ink)" : "var(--ink)"} strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 20px 16px", display: "flex", gap: 12, alignItems: "start", borderTop: "1px solid var(--line)" }}>
                        <span className="mono" style={{ fontSize: 10, background: "var(--paper)", color: "var(--muted)", padding: "2px 7px", borderRadius: 5, flexShrink: 0, marginTop: 14 }}>ANS</span>
                        <p style={{ margin: "12px 0 0", fontSize: 14, color: "var(--muted)", lineHeight: 1.75 }}>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!isSearching && (
              <div style={{ marginTop: 32, padding: "18px 22px", border: "1px dashed var(--line)", borderRadius: 12, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "space-between", maxWidth: "100%" }}>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>Want project-specific prep?</span> Every purchase includes a viva Q&amp;A guide tailored to your exact implementation.
                </div>
                <a
                  href="#catalog"
                  onClick={() => setVivaOpen(false)}
                  style={{ padding: "10px 18px", borderRadius: 999, background: accent, color: "var(--accent-ink)", textDecoration: "none", fontSize: 13, fontWeight: 500, flexShrink: 0 }}
                >
                  Browse projects →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
