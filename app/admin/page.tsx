"use client";

import React, { useState, useEffect } from "react";
import { useProjectHouse } from "@/components/providers/ThemeProvider";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { id: "ml", label: "Machine Learning" },
  { id: "dl", label: "Deep Learning" },
  { id: "cv", label: "Computer Vision" },
  { id: "web", label: "Web Applications" },
  { id: "mob", label: "Mobile Applications" },
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const COLORS = [
  { label: "Indigo", value: "#2A2FB8" },
  { label: "Deep Navy", value: "#0A0F2C" },
  { label: "Dark Indigo", value: "#1A1F7A" },
  { label: "Peach", value: "#FF8A5C" },
  { label: "Steel Blue", value: "#1E3A5F" },
  { label: "Forest", value: "#1A4731" },
  { label: "Crimson", value: "#7B1D1D" },
  { label: "Teal", value: "#134E4A" },
];

const EMPTY_FORM = {
  id: "",
  cat: "ml",
  title: "",
  tag: "",
  price: "",
  level: "Intermediate",
  stack: "",
  rating: "4.9",
  downloads: "0",
  color: "#2A2FB8",
  desc: "",
  files: "",
  pages: "",
  includes: "",
  youtubeLink: "",
};

type Project = {
  id: string;
  title: string;
  cat: string;
  price: number;
  level: string;
  created_at: string;
};

export default function AdminPage() {
  const { user, accent } = useProjectHouse();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState(EMPTY_FORM);
  const [projects, setProjects] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Auth guard
  useEffect(() => {
    if (loaded && (!user || !user.isAdmin)) {
      router.replace("/");
    }
  }, [user, loaded, router]);

  // Wait for ThemeProvider to hydrate
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Fetch projects from Supabase
  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data } = await supabase
      .from("projects")
      .select("id, title, cat, price, level, created_at")
      .order("created_at", { ascending: false });
    if (data) setProjects(data);
  }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  function field(key: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Auto-generate ID from title
  function generateId(title: string) {
    return "p" + title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) + Date.now().toString().slice(-4);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        id: form.id || generateId(form.title),
        cat: form.cat,
        title: form.title,
        tag: form.tag,
        price: parseInt(form.price),
        level: form.level,
        stack: form.stack.split(",").map((s) => s.trim()).filter(Boolean),
        rating: parseFloat(form.rating),
        downloads: parseInt(form.downloads) || 0,
        color: form.color,
        description: form.desc,
        files: parseInt(form.files) || 0,
        pages: parseInt(form.pages) || 0,
        includes: form.includes.split(",").map((s) => s.trim()).filter(Boolean),
        youtube_link: form.youtubeLink || null,
      };

      const { error } = await supabase.from("projects").insert(payload);
      if (error) throw error;
      showToast("✅ Project added successfully!");
      setForm(EMPTY_FORM);
      fetchProjects();
    } catch (err: any) {
      showToast("❌ " + (err.message ?? "Something went wrong"), false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) showToast("❌ " + error.message, false);
    else { showToast("🗑 Project deleted"); fetchProjects(); }
    setDeleting(null);
  }

  if (!loaded) return null;
  if (!user?.isAdmin) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--line)",
    background: "var(--paper-2)",
    color: "var(--ink)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--muted)",
    marginBottom: 6,
    letterSpacing: ".04em",
    textTransform: "uppercase",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid var(--line)",
        padding: "20px 28px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--card)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <a href="/" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 36, height: 36, borderRadius: 10,
          border: "1px solid var(--line)", background: "var(--paper-2)",
          textDecoration: "none", color: "var(--ink)", fontSize: 16,
        }}>←</a>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Admin Dashboard</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Signed in as {user.email}</div>
        </div>
        <span style={{
          marginLeft: 8, fontSize: 9, fontWeight: 700,
          letterSpacing: ".08em", textTransform: "uppercase",
          padding: "2px 6px", borderRadius: 4,
          background: accent, color: "var(--accent-ink)",
        }}>Admin</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 28px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>

        {/* Form */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 20, padding: 32 }}>
          <h2 style={{ margin: "0 0 28px", fontSize: 22, fontWeight: 700 }}>Add New Project</h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Row: Title + ID */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input required style={inputStyle} value={form.title} onChange={e => field("title", e.target.value)} placeholder="Credit Risk Scoring Engine" />
              </div>
              <div>
                <label style={labelStyle}>ID (auto if blank)</label>
                <input style={inputStyle} value={form.id} onChange={e => field("id", e.target.value)} placeholder="p01" />
              </div>
            </div>

            {/* Row: Category + Level */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Category *</label>
                <select required style={inputStyle} value={form.cat} onChange={e => field("cat", e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Level *</label>
                <select required style={inputStyle} value={form.level} onChange={e => field("level", e.target.value)}>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Row: Tag + Price */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Tag / Subtitle *</label>
                <input required style={inputStyle} value={form.tag} onChange={e => field("tag", e.target.value)} placeholder="Classification" />
              </div>
              <div>
                <label style={labelStyle}>Price (₹) *</label>
                <input required type="number" style={inputStyle} value={form.price} onChange={e => field("price", e.target.value)} placeholder="1499" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea required rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.desc} onChange={e => field("desc", e.target.value)} placeholder="Short description shown on the project card..." />
            </div>

            {/* Stack */}
            <div>
              <label style={labelStyle}>Tech Stack (comma-separated) *</label>
              <input required style={inputStyle} value={form.stack} onChange={e => field("stack", e.target.value)} placeholder="Python, scikit-learn, XGBoost, Streamlit" />
            </div>

            {/* Includes */}
            <div>
              <label style={labelStyle}>What's Included (comma-separated) *</label>
              <input required style={inputStyle} value={form.includes} onChange={e => field("includes", e.target.value)} placeholder="Full source code, Cleaned dataset, Report (PDF)" />
            </div>

            {/* Row: Files + Pages + Rating + Downloads */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Files</label>
                <input type="number" style={inputStyle} value={form.files} onChange={e => field("files", e.target.value)} placeholder="38" />
              </div>
              <div>
                <label style={labelStyle}>Pages</label>
                <input type="number" style={inputStyle} value={form.pages} onChange={e => field("pages", e.target.value)} placeholder="62" />
              </div>
              <div>
                <label style={labelStyle}>Rating</label>
                <input type="number" step="0.1" min="0" max="5" style={inputStyle} value={form.rating} onChange={e => field("rating", e.target.value)} placeholder="4.9" />
              </div>
              <div>
                <label style={labelStyle}>Downloads</label>
                <input type="number" style={inputStyle} value={form.downloads} onChange={e => field("downloads", e.target.value)} placeholder="0" />
              </div>
            </div>

            {/* Row: Color + YouTube */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Card Color</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.label}
                      onClick={() => field("color", c.value)}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: c.value, border: form.color === c.value ? "2px solid var(--ink)" : "2px solid transparent",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>YouTube Link</label>
                <input style={inputStyle} value={form.youtubeLink} onChange={e => field("youtubeLink", e.target.value)} placeholder="https://youtu.be/..." />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "14px 24px",
                borderRadius: 12,
                border: "none",
                background: saving ? "var(--muted)" : accent,
                color: "var(--accent-ink)",
                fontSize: 15,
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                marginTop: 4,
              }}
            >
              {saving ? "Saving..." : "Add Project"}
            </button>
          </form>
        </div>

        {/* Projects list */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 20, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
            Supabase Projects
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 400, marginLeft: 8 }}>({projects.length})</span>
          </h3>

          {projects.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
              No projects added yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {projects.map(p => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10,
                  background: "var(--paper-2)", border: "1px solid var(--line)",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {CATEGORIES.find(c => c.id === p.cat)?.label} · ₹{p.price.toLocaleString("en-IN")} · {p.level}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      border: "1px solid var(--line)", background: "transparent",
                      cursor: "pointer", color: "var(--muted)",
                      display: "grid", placeItems: "center", flexShrink: 0,
                    }}
                  >
                    {deleting === p.id ? "…" : (
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: toast.ok ? "var(--ink)" : "#7B1D1D",
          color: toast.ok ? "var(--paper)" : "#fff",
          padding: "12px 20px", borderRadius: 12,
          fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 24px rgba(0,0,0,.25)",
          zIndex: 999, whiteSpace: "nowrap",
          animation: "fadein .2s ease",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
