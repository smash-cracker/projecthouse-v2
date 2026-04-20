"use client";

import React, { useState, useEffect } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { ArrowUpRight } from "../ui/icons";
import { useIsMobile } from "../../hooks/useIsMobile";
import { createClient } from "@/utils/supabase/client";

export function Pricing() {
  const { accent } = useProjectHouse();
  const isMobile = useIsMobile();
  const supabase = createClient();

  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBundles() {
      try {
        const { data, error } = await supabase
          .from("bundles")
          .select("*")
          .order("price", { ascending: true });
        
        if (error) throw error;
        setBundles(data || []);
      } catch (err) {
        console.error("Error fetching bundles:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBundles();
  }, []);

  if (loading) return null; // Or a skeleton
  if (bundles.length === 0) return null;

  return (
    <section id="pricing" style={{ padding: isMobile ? "60px 16px" : "100px 28px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ maxWidth: 780 }}>
          <div
            className="mono"
            style={{ fontSize: 12, color: "var(--muted)", letterSpacing: ".15em", textTransform: "uppercase" }}
          >
            — Pricing
          </div>
          <h2
            className="serif"
            style={{ fontSize: "clamp(36px,5.2vw,78px)", lineHeight: 1, margin: "12px 0 18px", letterSpacing: "-.02em" }}
          >
            Pick one. Pack three. Or license the lot.
          </h2>
          <p style={{ fontSize: isMobile ? 16 : 18, color: "var(--muted)", lineHeight: 1.55, margin: 0, maxWidth: 620 }}>
            One-time payments. No subscriptions. Every project comes with lifetime access to its updates.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
            gap: 16,
            marginTop: 48,
          }}
        >
          {bundles.map((b) => {
            const feat = b.featured;
            return (
              <div
                key={b.id}
                style={{
                  position: "relative",
                  background: feat ? "var(--ink)" : "var(--card)",
                  color: feat ? "var(--paper)" : "var(--ink)",
                  border: feat ? "1px solid var(--ink)" : "1px solid var(--line)",
                  borderRadius: 22,
                  padding: isMobile ? 24 : 32,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: isMobile ? undefined : 500,
                }}
              >
                {feat && (
                  <div
                    style={{
                      position: "absolute",
                      top: -14,
                      left: 32,
                      background: accent,
                      color: "var(--accent-ink)",
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Most popular
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 11,
                        letterSpacing: ".15em",
                        textTransform: "uppercase",
                        color: feat ? "rgba(255,255,255,.6)" : "var(--muted)",
                      }}
                    >
                      {b.description}
                    </div>
                    <div className="serif" style={{ fontSize: 42, letterSpacing: "-.02em", marginTop: 6 }}>
                      {b.title}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 24, display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span className="serif" style={{ fontSize: isMobile ? 52 : 72, lineHeight: 0.95, letterSpacing: "-.04em" }}>
                    ₹{b.price.toLocaleString("en-IN")}
                  </span>
                  <span style={{ fontSize: 13, color: feat ? "rgba(255,255,255,.6)" : "var(--muted)" }}>one-time</span>
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "28px 0 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  {(b.features || []).map((f: string) => (
                    <li key={f} style={{ display: "flex", gap: 10, alignItems: "start", fontSize: 14, lineHeight: 1.4 }}>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: accent,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        <svg width="9" height="7" viewBox="0 0 10 8">
                          <path
                            d="M1 4l3 3 5-6"
                            stroke="var(--accent-ink)"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  style={{
                    marginTop: 28,
                    padding: "16px",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 15,
                    fontWeight: 500,
                    background: feat ? accent : "transparent",
                    color: feat ? "var(--accent-ink)" : "var(--ink)",
                    borderColor: feat ? "transparent" : "var(--ink)",
                    borderWidth: feat ? 0 : 1,
                    borderStyle: "solid",
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {b.cta || "Buy now"} <ArrowUpRight />
                </button>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 28,
            padding: isMobile ? "18px 16px" : "22px 28px",
            border: "1px dashed var(--line)",
            borderRadius: 16,
            display: "flex",
            alignItems: isMobile ? "start" : "center",
            justifyContent: "space-between",
            gap: 20,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{ width: 42, height: 42, borderRadius: "50%", background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M8 1l2 4.5L15 6l-3.5 3.5L12 15 8 12l-4 3 .5-5.5L1 6l5-.5L8 1z" fill="var(--accent-ink)" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Student discount · 30% off with a valid college ID</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
                Upload your ID card at checkout · UPI, cards &amp; netbanking accepted.
              </div>
            </div>
          </div>
          <button
            style={{
              padding: "12px 20px",
              borderRadius: 999,
              border: "1px solid var(--line)",
              background: "var(--card)",
              fontFamily: "inherit",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--ink)",
              whiteSpace: "nowrap",
            }}
          >
            How verification works →
          </button>
        </div>
      </div>
    </section>
  );
}
