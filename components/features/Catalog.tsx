"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { CATEGORIES } from "@/lib/data";
import { ProjectCard, ProjectCardSkeleton } from "./ProjectCard";
import { useIsMobile } from "../../hooks/useIsMobile";

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedTarget = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "10px 36px 10px 16px",
          borderRadius: 999,
          border: "1px solid var(--line)",
          background: "var(--card)",
          color: "var(--ink)",
          fontFamily: "inherit",
          fontSize: 13,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          minWidth: 160,
          textAlign: "left",
        }}
      >
        <span style={{ flex: 1 }}>{selectedTarget.label}</span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: "absolute", right: 14, pointerEvents: "none", color: "var(--muted)" }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: "100%",
            minWidth: 180,
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
            padding: 6,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: 2
          }}
        >
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--line)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "none",
                background: "transparent",
                color: value === o.value ? "var(--ink)" : "var(--muted)",
                fontFamily: "inherit",
                fontSize: 13,
                textAlign: "left",
                cursor: "pointer",
                fontWeight: value === o.value ? 500 : 400,
                transition: "background 0.15s, color 0.15s"
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Catalog() {
  const { accent, setOpenedProject, projects, projectsLoading } = useProjectHouse();
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("popular");
  const [q, setQ] = useState("");
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    let xs = projects.filter((p) => cat === "all" || p.cat === cat);
    if (q.trim()) {
      const s = q.toLowerCase();
      xs = xs.filter((p) =>
        (p.title + " " + p.tag + " " + p.stack.join(" ")).toLowerCase().includes(s)
      );
    }
    if (sort === "popular") xs = [...xs].sort((a, b) => b.downloads - a.downloads);
    if (sort === "price-l") xs = [...xs].sort((a, b) => a.price - b.price);
    if (sort === "price-h") xs = [...xs].sort((a, b) => b.price - a.price);
    if (sort === "rated") xs = [...xs].sort((a, b) => b.rating - a.rating);
    return xs;
  }, [cat, sort, q, projects]);

  return (
    <section id="catalog" style={{ padding: isMobile ? "60px 16px 40px" : "100px 28px 60px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: isMobile ? "start" : "end",
            justifyContent: "space-between",
            gap: isMobile ? 20 : 40,
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              className="mono"
              style={{
                fontSize: 12,
                color: "var(--muted)",
                letterSpacing: ".15em",
                textTransform: "uppercase",
              }}
            >
              — The Catalog
            </div>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(32px,5.2vw,78px)",
                lineHeight: 1,
                margin: "12px 0 0",
                letterSpacing: "-.02em",
                maxWidth: 900,
              }}
            >
              Projects picked for a <span style={{ fontStyle: "italic" }}>fast-changing</span> syllabus.
            </h2>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", width: isMobile ? "100%" : undefined }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid var(--line)",
                borderRadius: 999,
                padding: "8px 14px",
                background: "var(--card)",
                flex: isMobile ? 1 : undefined,
                width: isMobile ? undefined : 280,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search projects…"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 13,
                  color: "var(--ink)",
                  fontFamily: "inherit",
                  minWidth: 0,
                }}
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--muted)" }}
                >
                  ×
                </button>
              )}
            </div>
            <CustomSelect
              value={sort}
              onChange={setSort}
              options={[
                { value: "popular", label: "Most popular" },
                { value: "rated", label: "Highest rated" },
                { value: "price-l", label: "Price: low to high" },
                { value: "price-h", label: "Price: high to low" },
              ]}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 36,
            borderBottom: "1px solid var(--line)",
            paddingBottom: 16,
          }}
          id="categories"
        >
          {CATEGORIES.map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: active ? "1px solid var(--ink)" : "1px solid var(--line)",
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--paper)" : "var(--ink)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all .15s",
                }}
              >
                {c.label}
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 7px",
                    borderRadius: 999,
                    background: active ? accent : "var(--paper-2)",
                    color: active ? "var(--accent-ink)" : "var(--muted)",
                  }}
                >
                  {c.id === "all" ? projects.length : projects.filter((p) => p.cat === c.id).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result count */}
        <div
          className="mono"
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginTop: 20,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span>
            Showing {filtered.length} project{filtered.length !== 1 ? "s" : ""}{" "}
            {cat !== "all" && `· ${CATEGORIES.find((x) => x.id === cat)?.label}`}
          </span>
          {!isMobile && <span>Updated daily · next drop in 12 days</span>}
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(300px,1fr))",
            gap: 20,
            marginTop: 20,
          }}
        >
          {projectsLoading && Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
          {!projectsLoading && filtered.map((p, i) => (
            <ProjectCard
              key={p.id}
              p={p}
              accent={accent}
              onOpen={setOpenedProject}
              featured={i === 0 && cat === "all" && !q}
            />
          ))}
          {filtered.length === 0 && !q.trim() && !projectsLoading && (
            <div
              style={{
                gridColumn: "1/-1",
                padding: "60px 20px",
                textAlign: "center",
                color: "var(--muted)",
                border: "1px dashed var(--line)",
                borderRadius: 16,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>No projects yet</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Check back later — new projects are on the way.</div>
            </div>
          )}
          {filtered.length === 0 && q.trim() && (
            <div
              style={{
                gridColumn: "1/-1",
                padding: "60px 20px",
                textAlign: "center",
                color: "var(--muted)",
                border: "1px dashed var(--line)",
                borderRadius: 16,
              }}
            >
              No projects match &quot;<b>{q}</b>&quot; in this category. Try a broader search.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
