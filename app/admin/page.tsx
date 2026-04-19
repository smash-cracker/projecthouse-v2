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

// Default item names per category (prices are always set per-project)
const DEFAULT_TEMPLATES: Record<string, string[]> = {
  ml:  ["Full source code", "Cleaned dataset", "Trained model (.pkl)", "Report (PDF)", "README"],
  dl:  ["Full source code", "Jupyter notebook", "Pretrained weights", "Training history", "Report (PDF)"],
  cv:  ["Full source code", "Jupyter notebook", "Sample images", "Pretrained model", "Report (PDF)"],
  web: ["Full source code", "Database schema", "Deployment guide", "README"],
  mob: ["Full source code", "APK file", "UI assets", "README"],
};

type IncludeItem = { name: string; price: string };

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

function templateToItems(names: string[]): IncludeItem[] {
  return names.map((name) => ({ name, price: "0" }));
}

export default function AdminPage() {
  const { user, accent } = useProjectHouse();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState(EMPTY_FORM);
  const [includeItems, setIncludeItems] = useState<IncludeItem[]>(
    templateToItems(DEFAULT_TEMPLATES.ml)
  );
  const [templates, setTemplates] = useState<Record<string, string[]>>(DEFAULT_TEMPLATES);

  const [projects, setProjects] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);

  // Auth guard
  useEffect(() => {
    if (loaded && (!user || !user.isAdmin)) router.replace("/");
  }, [user, loaded, router]);

  // Hydrate + load saved templates
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    try {
      const saved = localStorage.getItem("admin_cat_templates");
      if (saved) setTemplates({ ...DEFAULT_TEMPLATES, ...JSON.parse(saved) });
    } catch {}
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { fetchProjects(); }, []);

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

  function handleCategoryChange(cat: string) {
    setForm((f) => ({ ...f, cat }));
    setIncludeItems(templateToItems(templates[cat] ?? []));
  }

  // Include item helpers
  function setItem(i: number, patch: Partial<IncludeItem>) {
    setIncludeItems((prev) => prev.map((item, idx) => idx === i ? { ...item, ...patch } : item));
  }
  function addItem() {
    setIncludeItems((prev) => [...prev, { name: "", price: "0" }]);
  }
  function removeItem(i: number) {
    setIncludeItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function saveTemplates() {
    setSavingTemplates(true);
    try {
      localStorage.setItem("admin_cat_templates", JSON.stringify(templates));
      showToast("✅ Templates saved!");
    } catch {
      showToast("❌ Failed to save", false);
    } finally {
      setSavingTemplates(false);
    }
  }

  function generateId(title: string) {
    return "p" + title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) + Date.now().toString().slice(-4);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (includeItems.some((i) => !i.name.trim())) {
      showToast("❌ All include items need a name", false);
      return;
    }
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
        includes: includeItems.map((i) => ({ name: i.name.trim(), price: parseInt(i.price) || 0 })),
        youtube_link: form.youtubeLink || null,
      };

      const { error } = await supabase.from("projects").insert(payload);
      if (error) throw error;
      showToast("✅ Project added successfully!");
      setForm(EMPTY_FORM);
      setIncludeItems(templateToItems(templates[EMPTY_FORM.cat] ?? []));
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

  const iconBtn: React.CSSProperties = {
    width: 30, height: 30, borderRadius: 8,
    border: "1px solid var(--line)", background: "transparent",
    cursor: "pointer", color: "var(--muted)",
    display: "grid", placeItems: "center", flexShrink: 0,
    fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid var(--line)",
        padding: "20px 28px",
        display: "flex", alignItems: "center", gap: 12,
        background: "var(--card)", position: "sticky", top: 0, zIndex: 10,
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

            {/* Title + ID */}
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

            {/* Category + Level */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Category *</label>
                <select required style={inputStyle} value={form.cat} onChange={e => handleCategoryChange(e.target.value)}>
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

            {/* Tag + Price */}
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

            {/* What's Included — structured rows */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>What's Included *</label>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>₹0 = bundled in project price</span>
              </div>

              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 30px", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, paddingLeft: 2 }}>Item</span>
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, paddingLeft: 2 }}>Price (₹)</span>
                <span />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {includeItems.map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 110px 30px", gap: 8 }}>
                    <input
                      style={{ ...inputStyle, fontSize: 13 }}
                      value={item.name}
                      onChange={e => setItem(i, { name: e.target.value })}
                      placeholder="e.g. Jupyter notebook"
                    />
                    <input
                      type="number"
                      min="0"
                      style={{ ...inputStyle, fontSize: 13 }}
                      value={item.price}
                      onChange={e => setItem(i, { price: e.target.value })}
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      style={iconBtn}
                      title="Remove"
                    >
                      <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addItem}
                style={{
                  marginTop: 10, padding: "8px 14px", borderRadius: 8,
                  border: "1px dashed var(--line)", background: "transparent",
                  color: "var(--muted)", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", width: "100%",
                }}
              >
                + Add item
              </button>
            </div>

            {/* Files + Pages + Rating + Downloads */}
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

            {/* Color + YouTube */}
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
                        background: c.value,
                        border: form.color === c.value ? "2px solid var(--ink)" : "2px solid transparent",
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
                padding: "14px 24px", borderRadius: 12, border: "none",
                background: saving ? "var(--muted)" : accent,
                color: "var(--accent-ink)", fontSize: 15, fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "inherit", marginTop: 4,
              }}
            >
              {saving ? "Saving..." : "Add Project"}
            </button>
          </form>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Category Templates */}
          <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 20, padding: 24 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Category Templates</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--muted)" }}>
              Default item names per category. Auto-fills the includes list when you pick a category. Prices are set per-project.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {CATEGORIES.map(c => (
                <div key={c.id}>
                  <label style={labelStyle}>{c.label}</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {(templates[c.id] ?? []).map((name, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 30px", gap: 6 }}>
                        <input
                          style={{ ...inputStyle, fontSize: 12, padding: "7px 10px" }}
                          value={name}
                          onChange={e => setTemplates(prev => ({
                            ...prev,
                            [c.id]: prev[c.id].map((n, ni) => ni === i ? e.target.value : n),
                          }))}
                        />
                        <button
                          type="button"
                          onClick={() => setTemplates(prev => ({
                            ...prev,
                            [c.id]: prev[c.id].filter((_, ni) => ni !== i),
                          }))}
                          style={{ ...iconBtn, width: "100%", height: 36 }}
                        >
                          <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
                            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setTemplates(prev => ({ ...prev, [c.id]: [...(prev[c.id] ?? []), ""] }))}
                      style={{
                        padding: "6px", borderRadius: 8,
                        border: "1px dashed var(--line)", background: "transparent",
                        color: "var(--muted)", fontSize: 11, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={saveTemplates}
              disabled={savingTemplates}
              style={{
                marginTop: 18, padding: "10px 18px", borderRadius: 10,
                border: "none", background: accent, color: "var(--accent-ink)",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", width: "100%",
              }}
            >
              {savingTemplates ? "Saving…" : "Save Templates"}
            </button>
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
                      style={iconBtn}
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

        </div>{/* end right column */}
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
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
