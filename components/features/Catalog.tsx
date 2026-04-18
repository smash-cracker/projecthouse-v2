"use client";

import React, { useState, useMemo } from "react";
import { useProjectHouse } from "../providers/ThemeProvider";
import { CATEGORIES, PROJECTS } from "@/lib/data";
import { ProjectCard } from "./ProjectCard";

export function Catalog() {
  const { accent, setOpenedProject } = useProjectHouse();
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("popular");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let xs = PROJECTS.filter((p) => cat === "all" || p.cat === cat);
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
  }, [cat, sort, q]);

  return (
    <section id="catalog" style={{ padding: "100px 28px 60px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "end",
            justifyContent: "space-between",
            gap: 40,
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
                fontSize: "clamp(44px,5.2vw,78px)",
                lineHeight: 1,
                margin: "12px 0 0",
                letterSpacing: "-.02em",
                maxWidth: 900,
              }}
            >
              Projects picked for a <span style={{ fontStyle: "italic" }}>fast-changing</span> syllabus.
            </h2>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid var(--line)",
                borderRadius: 999,
                padding: "8px 14px",
                background: "var(--card)",
                width: 280,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search projects, stacks, topics…"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 13,
                  color: "var(--ink)",
                  fontFamily: "inherit",
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
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid var(--line)",
                background: "var(--card)",
                color: "var(--ink)",
                fontFamily: "inherit",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <option value="popular">Most popular</option>
              <option value="rated">Highest rated</option>
              <option value="price-l">Price: low to high</option>
              <option value="price-h">Price: high to low</option>
            </select>
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
                  {c.id === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.cat === c.id).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Result count */}
        <div
          className="mono"
          style={{ fontSize: 12, color: "var(--muted)", marginTop: 20, display: "flex", justifyContent: "space-between" }}
        >
          <span>
            Showing {filtered.length} project{filtered.length !== 1 ? "s" : ""}{" "}
            {cat !== "all" && `· ${CATEGORIES.find((x) => x.id === cat)?.label}`}
          </span>
          <span>Updated daily · next drop in 12 days</span>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20, marginTop: 20 }}>
          {filtered.map((p, i) => (
            <ProjectCard
              key={p.id}
              p={p}
              accent={accent}
              onOpen={setOpenedProject}
              featured={i === 0 && cat === "all" && !q}
            />
          ))}
          {filtered.length === 0 && (
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
