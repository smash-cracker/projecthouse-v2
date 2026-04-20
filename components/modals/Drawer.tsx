"use client";

import React, { useState, useEffect } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { CATEGORIES } from "@/lib/data";
import { ArrowUpRight, Star } from "../ui/icons";
import { useIsMobile } from "../../hooks/useIsMobile";

import { DemoModal } from "./DemoModal";
import { PaymentSuccessModal } from "./PaymentSuccessModal";
import { PaymentFailureModal } from "./PaymentFailureModal";
import RazorpayButton from "../ui/RazorpayButton";
import { AbstractPanel, StackPanel } from "@/components/features/ProjectPanels";

const Stat = ({ n, l }: { n: number | string; l: string }) => (
  <div style={{ padding: "14px 16px", background: "var(--card)", border: "1px solid var(--line)", borderRadius: 10 }}>
    <div className="serif" style={{ fontSize: 32, lineHeight: 1, letterSpacing: "-.02em" }}>
      {n}
    </div>
    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{l}</div>
  </div>
);

export function Drawer() {
  const { openedProject: project, setOpenedProject, accent, purchasedProjectIds, refreshPurchases } = useProjectHouse();
  const [tab, setTab] = useState("overview");
  const [demoOpen, setDemoOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{ paymentId: string; amount: number } | null>(null);
  const [paymentFailure, setPaymentFailure] = useState<{ description?: string } | null>(null);
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
  const alreadyPurchased = purchasedProjectIds.includes((p as any).id);
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
            {alreadyPurchased ? (
              <a
                href={`/projects/${(p as any).id}`}
                style={{ padding: "14px 22px", borderRadius: 999, border: "none", background: "var(--ink)", color: "var(--paper)", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", gap: 8, alignItems: "center", textDecoration: "none" }}
              >
                Open project <ArrowUpRight />
              </a>
            ) : (
              <RazorpayButton
                amount={(customTotal || (p as any).price) * 100}
                name="Project House"
                description={(p as any).title}
                projectId={(p as any).id}
                projectTitle={(p as any).title}
                onSuccess={(paymentId) => {
                  refreshPurchases();
                  setPaymentSuccess({ paymentId, amount: (customTotal || (p as any).price) * 100 });
                }}
                onFailure={(err) => setPaymentFailure({ description: (err as any)?.description })}
                style={{ padding: "14px 22px", borderRadius: 999, border: "none", background: "var(--ink)", color: "var(--paper)", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", gap: 8, alignItems: "center" }}
              >
                Get this project <ArrowUpRight />
              </RazorpayButton>
            )}
          </div>
        </div>
      </aside>
      {demoOpen && <DemoModal project={p} onClose={() => setDemoOpen(false)} accent={accent} />}
      {paymentFailure && (
        <PaymentFailureModal
          projectTitle={(p as any).title}
          errorDescription={paymentFailure.description}
          accent={accent}
          onRetry={() => setPaymentFailure(null)}
          onClose={() => setPaymentFailure(null)}
        />
      )}
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
