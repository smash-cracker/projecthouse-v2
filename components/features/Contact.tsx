"use client";

import { useState } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { ArrowUpRight } from "../ui/icons";
import { useIsMobile } from "../../hooks/useIsMobile";

export function Contact() {
  const { accent } = useProjectHouse();
  const [copied, setCopied] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const handles = [
    {
      id: "wa",
      name: "WhatsApp",
      handle: "+91 70127 19561",
      sub: "Chat · Mon–Sat · 10am–9pm IST",
      cta: "Open chat",
      href: "https://wa.me/917012719561?text=Hi%20Project%20House%2C%20I%20have%20a%20question",
      bg: "#25D366",
      ink: "#0A0F2C",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M20.5 3.5A11.8 11.8 0 0012 0C5.4 0 .1 5.4.1 12c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7a12 12 0 005.7 1.4c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.2zM12 22a10 10 0 01-5.1-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A10 10 0 012 12 10 10 0 0112 2a10 10 0 0110 10 10 10 0 01-10 10zm5.5-7.5c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8 8 0 01-4-3.4c-.3-.5.3-.5.9-1.6.1-.2 0-.3 0-.5s-.7-1.7-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.1 3.1 1.3 3.3c.2.3 2.2 3.4 5.4 4.7 2 .8 2.7.9 3.7.8.6-.1 1.8-.8 2-1.5.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4z" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "tg",
      name: "Telegram",
      handle: "@projecthouse_admin",
      sub: "Live channel · daily drops · 2.4k members",
      cta: "Open channel",
      href: "https://t.me/projecthouse_admin",
      bg: "#229ED9",
      ink: "#ffffff",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 0a12 12 0 100 24 12 12 0 000-24zm5.6 8.2l-1.9 8.9c-.1.6-.5.8-1 .5l-2.8-2-1.3 1.3c-.2.1-.3.3-.5.3l.2-2.9 5.2-4.7c.2-.2 0-.3-.3-.2l-6.4 4-2.7-.9c-.6-.2-.6-.6.2-.9l10.5-4c.5-.2.9.1.8.6z" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "ph",
      name: "Phone",
      handle: "+91 70127 19561",
      sub: "Mon–Sat · 10am–7pm IST · English",
      cta: "Call now",
      href: "tel:+917012719561",
      bg: "#0A0F2C",
      ink: "#F3F0E6",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2a1 1 0 011-.2 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.4a1 1 0 011 1 11.4 11.4 0 00.6 3.6 1 1 0 01-.2 1l-2.2 2.2z" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "ml",
      name: "Email",
      handle: "collegeprojectshub@gmail.com",
      sub: "Replies in under 12 hours · invoices, custom work",
      cta: "Compose email",
      href: "mailto:collegeprojectshub@gmail.com?subject=Project%20House%20enquiry",
      bg: "#F6F4EE",
      ink: "#0A0F2C",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v.5l8 5 8-5V6H4zm16 2.9l-7.5 4.7a1 1 0 01-1 0L4 8.9V18h16V8.9z" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <section id="contact" style={{ padding: isMobile ? "60px 16px" : "100px 28px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1.3fr",
            gap: isMobile ? 16 : 60,
            alignItems: "end",
          }}
        >
          <div>
            <div
              className="mono"
              style={{ fontSize: 12, color: "var(--muted)", letterSpacing: ".15em", textTransform: "uppercase" }}
            >
              — Contact us
            </div>
            <h2
              className="serif"
              style={{ fontSize: "clamp(32px,5.2vw,78px)", lineHeight: 1, margin: "12px 0 0", letterSpacing: "-.02em" }}
            >
              Talk to a human. <span style={{ fontStyle: "italic" }}>Before</span> you buy.
            </h2>
          </div>
          <p style={{ fontSize: isMobile ? 15 : 17, color: "var(--muted)", lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
            Four ways to reach us — WhatsApp for quick questions, Telegram for release drops, phone when you need a voice, email for paperwork. Average reply time is under 12 hours.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: 14,
            marginTop: 48,
          }}
        >
          {handles.map((h) => (
            <div
              key={h.id}
              style={{
                background: h.bg,
                color: h.ink,
                borderRadius: 20,
                padding: isMobile ? 16 : 24,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minHeight: isMobile ? undefined : 240,
                border: h.bg === "#F6F4EE" ? "1px solid var(--line)" : "none",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(255,255,255,.15)",
                  display: "grid",
                  placeItems: "center",
                  backdropFilter: "blur(6px)",
                  flexShrink: 0,
                }}
              >
                {h.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  className="mono"
                  style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", opacity: 0.65 }}
                >
                  {h.name}
                </div>
                <div style={{ fontSize: isMobile ? 13 : 18, fontWeight: 600, marginTop: 4, letterSpacing: "-.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {h.handle}
                </div>
                {!isMobile && (
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, lineHeight: 1.5 }}>{h.sub}</div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <a
                  href={h.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 999,
                    background: h.ink,
                    color: h.bg,
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    textAlign: "center",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  {h.cta} <ArrowUpRight />
                </a>
                {!isMobile && (
                  <button
                    onClick={() => copy(h.handle, h.id)}
                    aria-label="Copy"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                      border: `1px solid ${h.ink}33`,
                      background: "transparent",
                      color: h.ink,
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {copied === h.id ? (
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                        <path d="M1 5l3.5 3.5L12 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
                        <rect x="3.5" y="1" width="8" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M2 4h-.5A.5.5 0 001 4.5V13a.5.5 0 00.5.5H9" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 28,
            padding: isMobile ? "18px 16px" : "22px 28px",
            borderRadius: 16,
            background: "var(--card)",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: isMobile ? "start" : "center",
            justifyContent: "space-between",
            gap: 20,
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{ width: 42, height: 42, borderRadius: "50%", background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="var(--accent-ink)" strokeWidth="1.6" />
                <path d="M9 5v4l2.5 2.5" stroke="var(--accent-ink)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Need a custom project? Book a free 20-min call.</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                We build bespoke capstones for ₹4,999 onwards with a 10-day turnaround.
              </div>
            </div>
          </div>
          <button
            style={{
              padding: "12px 20px",
              borderRadius: 999,
              border: "none",
              background: "var(--ink)",
              color: "var(--paper)",
              fontFamily: "inherit",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
            }}
          >
            Schedule a call <ArrowUpRight />
          </button>
        </div>
      </div>
    </section>
  );
}
