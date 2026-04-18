"use client";

import React, { useState, useEffect } from "react";

export function DemoModal({ project, onClose, accent }: { project: any; onClose: () => void; accent: string }) {
  const [step, setStep] = useState(0); // 0: picker, 1: confirmed
  const [dayIdx, setDayIdx] = useState(1);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  if (!project) return null;
  const isMobile = project.cat === "mob";

  // build next 14 days
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const slots = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
  const dayOff = days[dayIdx].getDay() === 0;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 150, display: "grid", placeItems: "center", padding: 20 }}
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, background: "#0A0F2C90", backdropFilter: "blur(6px)" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(640px,100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 20,
          boxShadow: "0 40px 80px -20px rgba(0,0,0,.5)",
        }}
        className="scroll"
      >
        <div
          style={{
            padding: "22px 28px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              className="mono"
              style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)" }}
            >
              {isMobile ? "Demo APK" : "Book a demo walkthrough"}
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>{project.title}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "1px solid var(--line)",
              background: "transparent",
              fontSize: 18,
              cursor: "pointer",
              color: "var(--ink)",
            }}
          >
            ×
          </button>
        </div>

        {isMobile ? (
          <div style={{ padding: 28 }}>
            <div
              style={{
                display: "flex",
                gap: 18,
                alignItems: "center",
                padding: 20,
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 14,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  background: project.color,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="#fff" strokeWidth="1.8" />
                  <circle cx="12" cy="18" r="1" fill="#fff" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{project.title}.apk</div>
                <div className="mono" style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                  Android 9.0+ · armeabi-v7a / arm64-v8a · 38.4 MB
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                padding: "14px 16px",
                background: "var(--paper-2)",
                borderRadius: 10,
                fontSize: 13,
                color: "var(--muted)",
                lineHeight: 1.55,
              }}
            >
              <b style={{ color: "var(--ink)" }}>Before you install:</b> enable &quot;Install unknown apps&quot; for your browser in Android
              Settings → Security. The demo build is watermarked and expires in 14 days.
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                onClick={() => {
                  const blob = new Blob(
                    [`# Project House demo build\n# ${project.title}\n# This is a placeholder APK stub.`],
                    { type: "application/vnd.android.package-archive" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = project.id + "-demo.apk";
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  setTimeout(() => URL.revokeObjectURL(url), 2000);
                }}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: 999,
                  border: "none",
                  background: "var(--ink)",
                  color: "var(--paper)",
                  fontFamily: "inherit",
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v8M3 6l4 4 4-4M1 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download APK (38.4 MB)
              </button>
              <button
                style={{
                  padding: "14px 18px",
                  borderRadius: 999,
                  border: "1px solid var(--line)",
                  background: "transparent",
                  fontFamily: "inherit",
                  fontSize: 14,
                  cursor: "pointer",
                  color: "var(--ink)",
                }}
              >
                QR for phone
              </button>
            </div>

            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Sample login", "demo@projecthouse.dev / demo1234"],
                ["Seeded data", "5 users, 120 records, 3 months history"],
              ].map(([h, t]) => (
                <div key={h} style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10 }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>
                    {h}
                  </div>
                  <div className="mono" style={{ fontSize: 12, marginTop: 3 }}>
                    {t}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : step === 1 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: accent,
                margin: "0 auto",
                display: "grid",
                placeItems: "center",
              }}
            >
              <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
                <path d="M2 11l9 9L28 2" stroke="var(--accent-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="serif" style={{ fontSize: 36, margin: "18px 0 8px", letterSpacing: "-.02em" }}>
              Demo confirmed.
            </h3>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0, lineHeight: 1.55 }}>
              We&apos;ll meet on{" "}
              <b style={{ color: "var(--ink)" }}>
                {days[dayIdx].toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </b>{" "}
              at <b style={{ color: "var(--ink)" }}>{slot}</b> (IST) for 1 hour.<br />
              A Google Meet link + calendar invite will arrive at <b style={{ color: "var(--ink)" }}>{email || "your email"}</b>{" "}
              within 5 minutes.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: 24,
                padding: "14px 26px",
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
              Done
            </button>
          </div>
        ) : (
          <div style={{ padding: 28 }}>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 18px", lineHeight: 1.55 }}>
              One-hour live walkthrough over Google Meet. We&apos;ll run the project end-to-end, show training notebooks, and answer any
              implementation questions before you buy.
            </p>

            {/* Day picker */}
            <div
              className="mono"
              style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}
            >
              1 · Pick a day
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }} className="scroll">
              {days.map((d, i) => {
                const active = i === dayIdx;
                const isSun = d.getDay() === 0;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setDayIdx(i);
                      setSlot(null);
                    }}
                    disabled={isSun}
                    style={{
                      flexShrink: 0,
                      width: 64,
                      padding: "10px 0",
                      borderRadius: 12,
                      cursor: isSun ? "not-allowed" : "pointer",
                      border: active ? "1px solid var(--ink)" : "1px solid var(--line)",
                      background: active ? "var(--ink)" : "var(--card)",
                      color: active ? "var(--paper)" : isSun ? "var(--muted)" : "var(--ink)",
                      fontFamily: "inherit",
                      opacity: isSun ? 0.5 : 1,
                      textAlign: "center",
                    }}
                  >
                    <div
                      className="mono"
                      style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.7 }}
                    >
                      {d.toLocaleDateString("en-IN", { weekday: "short" })}
                    </div>
                    <div className="serif" style={{ fontSize: 22, lineHeight: 1, marginTop: 4 }}>
                      {d.getDate()}
                    </div>
                    <div style={{ fontSize: 10, marginTop: 2, opacity: 0.6 }}>
                      {d.toLocaleDateString("en-IN", { month: "short" })}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Slot picker */}
            <div
              className="mono"
              style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)", marginTop: 22, marginBottom: 10 }}
            >
              2 · Pick a 1-hour slot <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--muted)", opacity: 0.7 }}>· IST</span>
            </div>
            {dayOff ? (
              <div
                style={{
                  padding: "20px",
                  border: "1px dashed var(--line)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--muted)",
                  textAlign: "center",
                }}
              >
                We don&apos;t host demos on Sundays. Pick another day.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {slots.map((s, i) => {
                  const booked = (i + dayIdx) % 5 === 0;
                  const active = slot === s;
                  return (
                    <button
                      key={s}
                      onClick={() => !booked && setSlot(s)}
                      disabled={booked}
                      style={{
                        padding: "12px",
                        borderRadius: 10,
                        cursor: booked ? "not-allowed" : "pointer",
                        border: active ? "1px solid var(--ink)" : "1px solid var(--line)",
                        background: active ? "var(--ink)" : booked ? "var(--paper-2)" : "var(--card)",
                        color: active ? "var(--paper)" : booked ? "var(--muted)" : "var(--ink)",
                        fontFamily: "inherit",
                        fontSize: 13,
                        textDecoration: booked ? "line-through" : "none",
                        opacity: booked ? 0.6 : 1,
                      }}
                    >
                      {s} – {(parseInt(s, 10) + 1).toString().padStart(2, "0")}:00
                    </button>
                  );
                })}
              </div>
            )}

            {/* Contact */}
            <div
              className="mono"
              style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)", marginTop: 22, marginBottom: 10 }}
            >
              3 · Your details
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  color: "var(--ink)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.ac.in"
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  color: "var(--ink)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <button
              disabled={!slot || !name || !email}
              onClick={() => setStep(1)}
              style={{
                marginTop: 22,
                width: "100%",
                padding: "16px",
                borderRadius: 999,
                border: "none",
                background: !slot || !name || !email ? "var(--paper-2)" : accent,
                color: !slot || !name || !email ? "var(--muted)" : "var(--accent-ink)",
                fontFamily: "inherit",
                fontWeight: 600,
                fontSize: 15,
                cursor: !slot || !name || !email ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              Confirm demo {slot && `· ${days[dayIdx].toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at ${slot}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
