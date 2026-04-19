"use client";

import React, { useState, useEffect } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { Logo, ArrowUpRight } from "../ui/icons";
import { useIsMobile } from "../../hooks/useIsMobile";

export function Nav() {
  const { dark, setDark, setSearchOpen, accent, user, setAuthOpen, signOut, setVivaOpen } = useProjectHouse();
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile nav on resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileNavOpen(false);
  }, [isMobile]);

  const NAV_LINKS = ["Catalog", "Categories", "Pricing", "Contact", "Guides"];

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50 }}>
      <div
        style={{
          background: scrolled
            ? "color-mix(in oklab, var(--paper) 85%, transparent)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
          transition: "background .2s, border-color .2s",
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "16px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <Logo accent={accent} />

          {/* Desktop nav — hidden via CSS on mobile */}
          <nav className="nav-desktop" style={{ gap: 4, alignItems: "center", fontSize: 14 }}>
            {NAV_LINKS.map((x) => (
              <a
                key={x}
                href={"#" + x.toLowerCase().replace(/ /g, "-")}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  textDecoration: "none",
                  color: "var(--ink)",
                }}
              >
                {x}
              </a>
            ))}
            <button
              onClick={() => setVivaOpen(true)}
              style={{
                padding: "10px 14px", borderRadius: 999, border: "none", background: "transparent",
                fontFamily: "inherit", fontSize: 14, color: "var(--ink)", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              Viva Prep
            </button>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Search — icon only on mobile */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 12px",
                borderRadius: 999,
                border: "1px solid var(--line)",
                background: "transparent",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {/* Search label — hidden on mobile via CSS */}
              <span className="nav-desktop" style={{ alignItems: "center", gap: 6 }}>
                Search{" "}
                <span
                  className="mono"
                  style={{ border: "1px solid var(--line)", padding: "1px 5px", borderRadius: 4, fontSize: 11 }}
                >
                  ⌘K
                </span>
              </span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
              style={{
                width: 38, height: 38, borderRadius: 999,
                border: "1px solid var(--line)", background: "transparent",
                cursor: "pointer", color: "var(--ink)", display: "grid", placeItems: "center",
              }}
            >
              {dark ? (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.4" />
                  <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <path d="M7.5 1v2" /><path d="M7.5 12v2" />
                    <path d="M1 7.5h2" /><path d="M12 7.5h2" />
                    <path d="M3 3l1.4 1.4" /><path d="M10.6 10.6L12 12" />
                    <path d="M3 12l1.4-1.4" /><path d="M10.6 4.4L12 3" />
                  </g>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M12 9.5A5 5 0 016 3.2a5 5 0 106.9 6.3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* Browse catalog — hidden on mobile via CSS */}
            <button
              className="nav-desktop"
              style={{
                padding: "10px 18px", borderRadius: 999, border: "none",
                background: "var(--ink)", color: "var(--paper)",
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                alignItems: "center", gap: 8,
              }}
            >
              Browse catalog <ArrowUpRight />
            </button>

            {/* User menu — desktop only via CSS */}
            <div className="nav-desktop" style={{ alignItems: "center" }}>
              {user ? (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "4px 10px 4px 4px", borderRadius: 999,
                      border: "1px solid var(--line)", background: "var(--card)",
                      color: "var(--ink)", cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: accent, color: "var(--accent-ink)",
                        display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600,
                      }}
                    >
                      {user.avatar}
                    </span>
                    <span style={{ fontSize: 13 }}>{user.name.split(" ")[0]}</span>
                    <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
                      <path d="M1 1l3.5 3.5L8 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <>
                      <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                      <div
                        style={{
                          position: "absolute", top: "calc(100% + 8px)", right: 0, width: 240,
                          background: "var(--paper)", border: "1px solid var(--line)",
                          borderRadius: 14, padding: 8, zIndex: 41,
                          boxShadow: "0 18px 40px rgba(10,15,44,.18)",
                        }}
                      >
                        <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid var(--line)", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</span>
                            {user.isAdmin && (
                              <span style={{
                                fontSize: 9, fontWeight: 700, letterSpacing: ".08em",
                                textTransform: "uppercase", padding: "2px 6px",
                                borderRadius: 4, background: accent, color: "var(--accent-ink)",
                              }}>Admin</span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, wordBreak: "break-all" }}>{user.email}</div>
                          <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 6, letterSpacing: ".1em", textTransform: "uppercase" }}>
                            Signed in with {user.provider}
                          </div>
                        </div>
                        {user.isAdmin && (
                          <a href="/admin" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, fontSize: 13, color: accent, textDecoration: "none", fontWeight: 600 }}>
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/></svg>
                            Admin Dashboard
                          </a>
                        )}
                        {["My projects", "Favorites"].map((x) => (
                          <a key={x} href="#" style={{ display: "block", padding: "8px 12px", borderRadius: 8, fontSize: 13, color: "var(--ink)", textDecoration: "none" }}>
                            {x}
                          </a>
                        ))}
                        <button
                          onClick={() => { signOut(); setMenuOpen(false); }}
                          style={{
                            width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 8,
                            fontSize: 13, background: "transparent", border: "none",
                            color: "var(--muted)", cursor: "pointer", fontFamily: "inherit",
                            marginTop: 4, borderTop: "1px solid var(--line)", paddingTop: 10,
                          }}
                        >
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  style={{
                    padding: "10px 18px", borderRadius: 999, border: "1px solid var(--line)",
                    background: "transparent", color: "var(--ink)", cursor: "pointer",
                    fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                  }}
                >
                  Sign in
                </button>
              )}
            </div>

            {/* Hamburger — mobile only via CSS */}
            <button
              className="nav-mobile"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Menu"
              style={{
                width: 38, height: 38, borderRadius: 999,
                border: "1px solid var(--line)", background: "transparent",
                cursor: "pointer", color: "var(--ink)", alignItems: "center", justifyContent: "center",
              }}
            >
              {mobileNavOpen ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
                  <path d="M1 1h13M1 6h13M1 11h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {isMobile && mobileNavOpen && (
          <div
            style={{
              background: "var(--paper)",
              borderTop: "1px solid var(--line)",
              padding: "12px 16px 20px",
            }}
          >
            {NAV_LINKS.map((x) => (
              <a
                key={x}
                href={"#" + x.toLowerCase().replace(/ /g, "-")}
                onClick={() => setMobileNavOpen(false)}
                style={{
                  display: "block", padding: "12px 4px",
                  borderBottom: "1px solid var(--line)",
                  textDecoration: "none", color: "var(--ink)", fontSize: 15,
                }}
              >
                {x}
              </a>
            ))}
            <button
              onClick={() => { setVivaOpen(true); setMobileNavOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "12px 4px",
                background: "none", border: "none", borderBottom: "1px solid var(--line)",
                color: "var(--ink)", fontSize: 15, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Viva Prep
            </button>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {user ? (
                <div>
                  <div style={{ padding: "10px 4px", borderBottom: "1px solid var(--line)", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</span>
                      {user.isAdmin && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: ".08em",
                          textTransform: "uppercase", padding: "2px 6px",
                          borderRadius: 4, background: accent, color: "var(--accent-ink)",
                        }}>Admin</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{user.email}</div>
                  </div>
                  {user.isAdmin && (
                    <a
                      href="/admin"
                      onClick={() => setMobileNavOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 4px", borderBottom: "1px solid var(--line)",
                        textDecoration: "none", color: accent, fontSize: 14, fontWeight: 600,
                      }}
                    >
                      Admin Dashboard
                    </a>
                  )}
                  {["My projects", "Favorites"].map((x) => (
                    <a
                      key={x}
                      href="#"
                      onClick={() => setMobileNavOpen(false)}
                      style={{
                        display: "block", padding: "10px 4px",
                        borderBottom: "1px solid var(--line)",
                        textDecoration: "none", color: "var(--ink)", fontSize: 14,
                      }}
                    >
                      {x}
                    </a>
                  ))}
                  <button
                    onClick={() => { signOut(); setMobileNavOpen(false); }}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 4px",
                      background: "none", border: "none", color: "var(--muted)",
                      fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginTop: 4,
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setAuthOpen(true); setMobileNavOpen(false); }}
                  style={{
                    padding: "12px 18px", borderRadius: 999,
                    border: "1px solid var(--line)", background: "transparent",
                    color: "var(--ink)", cursor: "pointer", fontSize: 14,
                    fontWeight: 500, fontFamily: "inherit",
                  }}
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        )}

        <div style={{ height: 2, background: "transparent" }}>
          <div
            style={{
              height: "100%",
              width: progress * 100 + "%",
              background: accent,
              transition: "width .08s linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}
