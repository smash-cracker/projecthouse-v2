"use client";

import React, { useState, useEffect } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { useIsMobile } from "../../hooks/useIsMobile";

export function DemoModal({ project, onClose, accent }: { project: any; onClose: () => void; accent: string }) {
  const { user, setAuthOpen } = useProjectHouse();
  const isMobile = useIsMobile();

  const [step, setStep] = useState(0); // 0: picker, 1: confirmed
  const [dayIdx, setDayIdx] = useState(1);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Pre-fill from logged-in user
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project, onClose]);

  // Fetch real booked slots whenever day or project changes
  useEffect(() => {
    if (!project || !days[dayIdx]) return;
    const dateStr = days[dayIdx].toISOString().slice(0, 10);
    setLoadingSlots(true);
    fetch(`/api/bookings?project_id=${encodeURIComponent(project.id)}&date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => setBookedSlots(data.booked || []))
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, dayIdx]);

  if (!project) return null;
  const isAndroid = project.cat === "mob";

  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const slots = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
  const dayOff = days[dayIdx].getDay() === 0;

  const canConfirm = !!slot && !!name.trim() && !!email.trim() && !submitting;

  const handleConfirm = async () => {
    if (!canConfirm) return;

    if (!user) {
      // Close demo modal, open auth modal
      onClose();
      setAuthOpen(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const dateStr = days[dayIdx].toISOString().slice(0, 10);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project.id,
          project_title: project.title,
          name: name.trim(),
          email: email.trim(),
          slot_date: dateStr,
          slot_time: slot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStep(1);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
        {/* Header */}
        <div
          style={{
            padding: isMobile ? "14px 16px" : "22px 28px",
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
              {isAndroid ? "Demo APK" : "Book a demo walkthrough"}
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>{project.title}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 999, border: "1px solid var(--line)",
              background: "transparent", fontSize: 18, cursor: "pointer", color: "var(--ink)",
            }}
          >
            ×
          </button>
        </div>

        {/* Mobile: APK download */}
        {isAndroid ? (
          <div style={{ padding: isMobile ? 16 : 28 }}>
            <div
              style={{
                display: "flex", gap: 18, alignItems: "center", padding: 20,
                background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14,
              }}
            >
              <div
                style={{
                  width: 64, height: 64, borderRadius: 14, background: project.color,
                  display: "grid", placeItems: "center",
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
                marginTop: 18, padding: "14px 16px", background: "var(--paper-2)",
                borderRadius: 10, fontSize: 13, color: "var(--muted)", lineHeight: 1.55,
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
                  flex: 1, padding: "14px", borderRadius: 999, border: "none",
                  background: "var(--ink)", color: "var(--paper)", fontFamily: "inherit",
                  fontWeight: 500, fontSize: 14, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v8M3 6l4 4 4-4M1 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download APK (38.4 MB)
              </button>
              <button
                style={{
                  padding: "14px 18px", borderRadius: 999, border: "1px solid var(--line)",
                  background: "transparent", fontFamily: "inherit", fontSize: 14, cursor: "pointer", color: "var(--ink)",
                }}
              >
                QR for phone
              </button>
            </div>

            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
              {[
                ["Sample login", "demo@projecthouse.dev / demo1234"],
                ["Seeded data", "5 users, 120 records, 3 months history"],
              ].map(([h, t]) => (
                <div key={h} style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10 }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>
                    {h}
                  </div>
                  <div className="mono" style={{ fontSize: 12, marginTop: 3 }}>{t}</div>
                </div>
              ))}
            </div>
          </div>

        ) : step === 1 ? (
          /* Confirmation screen */
          <div style={{ padding: isMobile ? 24 : 40, textAlign: "center" }}>
            <div
              style={{
                width: 72, height: 72, borderRadius: "50%", background: accent,
                margin: "0 auto", display: "grid", placeItems: "center",
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
              at <b style={{ color: "var(--ink)" }}>{slot}</b> IST for 1 hour.<br />
              A Google Meet link + calendar invite will arrive at{" "}
              <b style={{ color: "var(--ink)" }}>{email}</b> within 5 minutes.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: 24, padding: "14px 26px", borderRadius: 999, border: "none",
                background: "var(--ink)", color: "var(--paper)", fontFamily: "inherit",
                fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>

        ) : (
          /* Booking form */
          <div style={{ padding: isMobile ? 16 : 28 }}>

            {/* Auth notice if not signed in */}
            {!user && (
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, padding: "12px 16px", borderRadius: 10, marginBottom: 18,
                  background: `${accent}18`, border: `1px solid ${accent}44`,
                }}
              >
                <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.4 }}>
                  <b>Sign in to book.</b> Your slot is reserved instantly after login.
                </div>
                <button
                  onClick={() => { onClose(); setAuthOpen(true); }}
                  style={{
                    padding: "8px 16px", borderRadius: 999, border: "none", flexShrink: 0,
                    background: accent, color: "var(--accent-ink)", fontFamily: "inherit",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Sign in
                </button>
              </div>
            )}

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
                    onClick={() => { setDayIdx(i); setSlot(null); }}
                    disabled={isSun}
                    style={{
                      flexShrink: 0, width: 64, padding: "10px 0", borderRadius: 12,
                      cursor: isSun ? "not-allowed" : "pointer",
                      border: active ? "1px solid var(--ink)" : "1px solid var(--line)",
                      background: active ? "var(--ink)" : "var(--card)",
                      color: active ? "var(--paper)" : isSun ? "var(--muted)" : "var(--ink)",
                      fontFamily: "inherit", opacity: isSun ? 0.5 : 1, textAlign: "center",
                    }}
                  >
                    <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", opacity: 0.7 }}>
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
              2 · Pick a 1-hour slot{" "}
              <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--muted)", opacity: 0.7 }}>· IST</span>
              {loadingSlots && <span style={{ opacity: 0.5, marginLeft: 8 }}>loading…</span>}
            </div>
            {dayOff ? (
              <div
                style={{
                  padding: 20, border: "1px dashed var(--line)", borderRadius: 10,
                  fontSize: 13, color: "var(--muted)", textAlign: "center",
                }}
              >
                We don&apos;t host demos on Sundays. Pick another day.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 8 }}>
                {slots.map((s) => {
                  const booked = bookedSlots.includes(s);
                  const active = slot === s;
                  return (
                    <button
                      key={s}
                      onClick={() => !booked && setSlot(s)}
                      disabled={booked || loadingSlots}
                      style={{
                        padding: "12px", borderRadius: 10,
                        cursor: booked ? "not-allowed" : "pointer",
                        border: active ? "1px solid var(--ink)" : "1px solid var(--line)",
                        background: active ? "var(--ink)" : booked ? "var(--paper-2)" : "var(--card)",
                        color: active ? "var(--paper)" : booked ? "var(--muted)" : "var(--ink)",
                        fontFamily: "inherit", fontSize: 13,
                        textDecoration: booked ? "line-through" : "none",
                        opacity: booked ? 0.5 : 1,
                        transition: "all .12s",
                      }}
                    >
                      {s} – {(parseInt(s, 10) + 1).toString().padStart(2, "0")}:00
                      {booked && <div style={{ fontSize: 10, marginTop: 2 }}>Booked</div>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Contact details */}
            <div
              className="mono"
              style={{ fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--muted)", marginTop: 22, marginBottom: 10 }}
            >
              3 · Your details
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                style={{
                  padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)",
                  background: "var(--card)", color: "var(--ink)", fontFamily: "inherit",
                  fontSize: 14, outline: "none",
                }}
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.ac.in"
                type="email"
                style={{
                  padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)",
                  background: "var(--card)", color: "var(--ink)", fontFamily: "inherit",
                  fontSize: 14, outline: "none",
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  marginTop: 14, padding: "10px 14px", borderRadius: 10,
                  background: "#ff4d4f18", border: "1px solid #ff4d4f44",
                  fontSize: 13, color: "#c00",
                }}
              >
                {error}
              </div>
            )}

            {/* Confirm button */}
            <button
              disabled={!slot || !name.trim() || !email.trim() || submitting}
              onClick={handleConfirm}
              style={{
                marginTop: 22, width: "100%", padding: "16px", borderRadius: 999, border: "none",
                background: !slot || !name.trim() || !email.trim() || submitting ? "var(--paper-2)" : accent,
                color: !slot || !name.trim() || !email.trim() || submitting ? "var(--muted)" : "var(--accent-ink)",
                fontFamily: "inherit", fontWeight: 600, fontSize: 15,
                cursor: !slot || !name.trim() || !email.trim() || submitting ? "not-allowed" : "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
                transition: "background .15s",
              }}
            >
              {submitting ? (
                "Booking…"
              ) : !user ? (
                "Sign in to confirm"
              ) : slot ? (
                `Confirm · ${days[dayIdx].toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at ${slot}`
              ) : (
                "Pick a slot to continue"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
