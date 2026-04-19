"use client";

import React, { useState, useEffect } from "react";
import { useProjectHouse } from "@/components/providers/ThemeProvider";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { VIVA_TABS, VIVA_QA } from "@/lib/data";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "ml", label: "Machine Learning" },
  { id: "dl", label: "Deep Learning" },
  { id: "cv", label: "Computer Vision" },
  { id: "web", label: "Web Applications" },
  { id: "mob", label: "Mobile Applications" },
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const COLORS = [
  { label: "Indigo",     value: "#2A2FB8" },
  { label: "Deep Navy",  value: "#0A0F2C" },
  { label: "Dark Indigo",value: "#1A1F7A" },
  { label: "Peach",      value: "#FF8A5C" },
  { label: "Steel Blue", value: "#1E3A5F" },
  { label: "Forest",     value: "#1A4731" },
  { label: "Crimson",    value: "#7B1D1D" },
  { label: "Teal",       value: "#134E4A" },
];

const DEFAULT_TEMPLATES: Record<string, string[]> = {
  ml:  ["Full source code", "Cleaned dataset", "Trained model (.pkl)", "Report (PDF)", "README"],
  dl:  ["Full source code", "Jupyter notebook", "Pretrained weights", "Training history", "Report (PDF)"],
  cv:  ["Full source code", "Jupyter notebook", "Sample images", "Pretrained model", "Report (PDF)"],
  web: ["Full source code", "Database schema", "Deployment guide", "README"],
  mob: ["Full source code", "APK file", "UI assets", "README"],
};

type IncludeItem = { name: string; price: string };
type QA = { q: string; a: string };
type Section = "projects" | "templates" | "viva";

const EMPTY_FORM = {
  id: "", cat: "ml", title: "", tag: "", price: "", level: "Intermediate",
  stack: "", rating: "4.9", downloads: "0", color: "#2A2FB8",
  desc: "", files: "", pages: "", youtubeLink: "",
};

type Project = { id: string; title: string; cat: string; price: number; level: string; created_at: string };

function templateToItems(names: string[]): IncludeItem[] {
  return names.map((name) => ({ name, price: "0" }));
}

// ─── Nav link ─────────────────────────────────────────────────────────────────

function NavLink({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: "10px 14px", borderRadius: 10, border: "none",
        background: active ? "var(--paper-2)" : "transparent",
        color: active ? "var(--ink)" : "var(--muted)",
        fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 400,
        cursor: "pointer", textAlign: "left",
        display: "flex", alignItems: "center", gap: 10,
        transition: "background .15s, color .15s",
      }}
    >
      <span style={{ opacity: active ? 1 : 0.6, display: "flex" }}>{icon}</span>
      {label}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, accent } = useProjectHouse();
  const router = useRouter();
  const supabase = createClient();

  const [section, setSection] = useState<Section>("projects");
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Projects state
  const [form, setForm] = useState(EMPTY_FORM);
  const [includeItems, setIncludeItems] = useState<IncludeItem[]>(templateToItems(DEFAULT_TEMPLATES.ml));
  const [projects, setProjects] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Templates state
  const [templates, setTemplates] = useState<Record<string, string[]>>(DEFAULT_TEMPLATES);
  const [savingTemplates, setSavingTemplates] = useState(false);

  // Viva state
  const [vivaData, setVivaData] = useState<Record<string, QA[]>>({});
  const [vivaTab, setVivaTab] = useState("ml");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<QA>({ q: "", a: "" });
  const [addForm, setAddForm] = useState<QA>({ q: "", a: "" });
  const [addingNew, setAddingNew] = useState(false);
  const [savingViva, setSavingViva] = useState(false);

  // Auth guard
  useEffect(() => {
    if (loaded && (!user || !user.isAdmin)) router.replace("/");
  }, [user, loaded, router]);

  // Hydrate
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    try {
      const tmpl = localStorage.getItem("admin_cat_templates");
      if (tmpl) setTemplates({ ...DEFAULT_TEMPLATES, ...JSON.parse(tmpl) });
      const viva = localStorage.getItem("admin_viva_qa");
      setVivaData(viva ? JSON.parse(viva) : structuredClone(VIVA_QA));
    } catch {
      setVivaData(structuredClone(VIVA_QA));
    }
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

  // ── Projects ────────────────────────────────────────────────────────────────

  function field(key: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleCategoryChange(cat: string) {
    setForm((f) => ({ ...f, cat }));
    setIncludeItems(templateToItems(templates[cat] ?? []));
  }

  function setItem(i: number, patch: Partial<IncludeItem>) {
    setIncludeItems((prev) => prev.map((item, idx) => idx === i ? { ...item, ...patch } : item));
  }

  function generateId(title: string) {
    return "p" + title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) + Date.now().toString().slice(-4);
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (includeItems.some((i) => !i.name.trim())) {
      showToast("❌ All include items need a name", false);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        id: form.id || generateId(form.title),
        cat: form.cat, title: form.title, tag: form.tag,
        price: parseInt(form.price), level: form.level,
        stack: form.stack.split(",").map((s) => s.trim()).filter(Boolean),
        rating: parseFloat(form.rating),
        downloads: parseInt(form.downloads) || 0,
        color: form.color, description: form.desc,
        files: parseInt(form.files) || 0, pages: parseInt(form.pages) || 0,
        includes: includeItems.map((i) => ({ name: i.name.trim(), price: parseInt(i.price) || 0 })),
        youtube_link: form.youtubeLink || null,
      };
      const { error } = await supabase.from("projects").insert(payload);
      if (error) throw error;
      showToast("✅ Project added!");
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

  // ── Templates ───────────────────────────────────────────────────────────────

  function saveTemplates() {
    setSavingTemplates(true);
    try {
      localStorage.setItem("admin_cat_templates", JSON.stringify(templates));
      showToast("✅ Templates saved!");
    } catch { showToast("❌ Failed to save", false); }
    finally { setSavingTemplates(false); }
  }

  // ── Viva ─────────────────────────────────────────────────────────────────────

  function persistViva(next: Record<string, QA[]>) {
    setVivaData(next);
    localStorage.setItem("admin_viva_qa", JSON.stringify(next));
  }

  function startEdit(idx: number) {
    setEditingIdx(idx);
    setEditForm({ ...vivaData[vivaTab][idx] });
    setAddingNew(false);
  }

  function cancelEdit() { setEditingIdx(null); }

  function saveEdit() {
    if (!editForm.q.trim() || !editForm.a.trim()) { showToast("❌ Question and answer are required", false); return; }
    setSavingViva(true);
    const next = { ...vivaData, [vivaTab]: vivaData[vivaTab].map((qa, i) => i === editingIdx ? editForm : qa) };
    persistViva(next);
    setEditingIdx(null);
    setSavingViva(false);
    showToast("✅ Question updated!");
  }

  function deleteQA(idx: number) {
    const next = { ...vivaData, [vivaTab]: vivaData[vivaTab].filter((_, i) => i !== idx) };
    persistViva(next);
    showToast("🗑 Question deleted");
  }

  function saveAdd() {
    if (!addForm.q.trim() || !addForm.a.trim()) { showToast("❌ Question and answer are required", false); return; }
    setSavingViva(true);
    const next = { ...vivaData, [vivaTab]: [...(vivaData[vivaTab] ?? []), addForm] };
    persistViva(next);
    setAddForm({ q: "", a: "" });
    setAddingNew(false);
    setSavingViva(false);
    showToast("✅ Question added!");
  }

  if (!loaded) return null;
  if (!user?.isAdmin) return null;

  // ─── Styles ──────────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "1px solid var(--line)", background: "var(--paper-2)",
    color: "var(--ink)", fontSize: 14, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)",
    marginBottom: 6, letterSpacing: ".04em", textTransform: "uppercase",
  };

  const iconBtn: React.CSSProperties = {
    width: 30, height: 30, borderRadius: 8,
    border: "1px solid var(--line)", background: "transparent",
    cursor: "pointer", color: "var(--muted)",
    display: "grid", placeItems: "center", flexShrink: 0,
    fontFamily: "inherit",
  };

  const card: React.CSSProperties = {
    background: "var(--card)", border: "1px solid var(--line)", borderRadius: 20, padding: 32,
  };

  // ─── Sections ────────────────────────────────────────────────────────────────

  const ProjectsSection = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>

      {/* Add form */}
      <div style={card}>
        <h2 style={{ margin: "0 0 28px", fontSize: 20, fontWeight: 700 }}>Add New Project</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

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

          <div>
            <label style={labelStyle}>Description *</label>
            <textarea required rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.desc} onChange={e => field("desc", e.target.value)} placeholder="Short description..." />
          </div>

          <div>
            <label style={labelStyle}>Tech Stack (comma-separated) *</label>
            <input required style={inputStyle} value={form.stack} onChange={e => field("stack", e.target.value)} placeholder="Python, scikit-learn, XGBoost" />
          </div>

          {/* Includes */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>What's Included *</label>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>₹0 = bundled</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 30px", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, paddingLeft: 2 }}>Item</span>
              <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, paddingLeft: 2 }}>Price (₹)</span>
              <span />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {includeItems.map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 110px 30px", gap: 8 }}>
                  <input style={{ ...inputStyle, fontSize: 13 }} value={item.name} onChange={e => setItem(i, { name: e.target.value })} placeholder="e.g. Jupyter notebook" />
                  <input type="number" min="0" style={{ ...inputStyle, fontSize: 13 }} value={item.price} onChange={e => setItem(i, { price: e.target.value })} placeholder="0" />
                  <button type="button" onClick={() => setIncludeItems(p => p.filter((_, idx) => idx !== i))} style={iconBtn} title="Remove">
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setIncludeItems(p => [...p, { name: "", price: "0" }])}
              style={{ marginTop: 10, padding: "8px 14px", borderRadius: 8, border: "1px dashed var(--line)", background: "transparent", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
              + Add item
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            {[["files","Files","38"],["pages","Pages","62"],["rating","Rating","4.9"],["downloads","Downloads","0"]].map(([k, lbl, ph]) => (
              <div key={k}>
                <label style={labelStyle}>{lbl}</label>
                <input type="number" step={k === "rating" ? "0.1" : "1"} min="0" max={k === "rating" ? "5" : undefined}
                  style={inputStyle} value={(form as any)[k]} onChange={e => field(k as any, e.target.value)} placeholder={ph} />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Card Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLORS.map(c => (
                  <button key={c.value} type="button" title={c.label} onClick={() => field("color", c.value)}
                    style={{ width: 28, height: 28, borderRadius: 8, background: c.value, border: form.color === c.value ? "2px solid var(--ink)" : "2px solid transparent", cursor: "pointer" }} />
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>YouTube Link</label>
              <input style={inputStyle} value={form.youtubeLink} onChange={e => field("youtubeLink", e.target.value)} placeholder="https://youtu.be/..." />
            </div>
          </div>

          <button type="submit" disabled={saving}
            style={{ padding: "14px 24px", borderRadius: 12, border: "none", background: saving ? "var(--muted)" : accent, color: "var(--accent-ink)", fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 4 }}>
            {saving ? "Saving..." : "Add Project"}
          </button>
        </form>
      </div>

      {/* Project list */}
      <div style={{ ...card, padding: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
          Supabase Projects <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 400, marginLeft: 6 }}>({projects.length})</span>
        </h3>
        {projects.length === 0 ? (
          <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>No projects yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {projects.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "var(--paper-2)", border: "1px solid var(--line)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {CATEGORIES.find(c => c.id === p.cat)?.label} · ₹{p.price.toLocaleString("en-IN")} · {p.level}
                  </div>
                </div>
                <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} style={iconBtn}>
                  {deleting === p.id ? "…" : <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const TemplatesSection = (
    <div style={{ maxWidth: 640 }}>
      <div style={card}>
        <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>Category Templates</h2>
        <p style={{ margin: "0 0 28px", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
          Default item names per category. Auto-fills the includes list when you pick a category. Prices are set per-project.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {CATEGORIES.map(c => (
            <div key={c.id}>
              <label style={labelStyle}>{c.label}</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(templates[c.id] ?? []).map((name, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 30px", gap: 6 }}>
                    <input style={{ ...inputStyle, fontSize: 13 }} value={name}
                      onChange={e => setTemplates(prev => ({ ...prev, [c.id]: prev[c.id].map((n, ni) => ni === i ? e.target.value : n) }))} />
                    <button type="button" style={{ ...iconBtn, width: "100%", height: 42 }}
                      onClick={() => setTemplates(prev => ({ ...prev, [c.id]: prev[c.id].filter((_, ni) => ni !== i) }))}>
                      <svg width="9" height="9" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setTemplates(prev => ({ ...prev, [c.id]: [...(prev[c.id] ?? []), ""] }))}
                  style={{ padding: "7px", borderRadius: 8, border: "1px dashed var(--line)", background: "transparent", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  + Add item
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={saveTemplates} disabled={savingTemplates}
          style={{ marginTop: 28, padding: "12px 24px", borderRadius: 12, border: "none", background: accent, color: "var(--accent-ink)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {savingTemplates ? "Saving…" : "Save Templates"}
        </button>
      </div>
    </div>
  );

  const currentQAs = vivaData[vivaTab] ?? [];

  const VivaSection = (
    <div style={{ maxWidth: 780 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Viva Data</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Manage viva prep questions per category.</p>
        </div>
        <button
          onClick={() => { setAddingNew(true); setEditingIdx(null); setAddForm({ q: "", a: "" }); }}
          style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: accent, color: "var(--accent-ink)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          + Add Question
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {VIVA_TABS.map(t => {
          const active = vivaTab === t.id;
          return (
            <button key={t.id} onClick={() => { setVivaTab(t.id); setEditingIdx(null); setAddingNew(false); }}
              style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid var(--line)", fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", background: active ? accent : "var(--card)", color: active ? "var(--accent-ink)" : "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{t.icon}</span> {t.label}
              <span style={{ fontSize: 11, opacity: 0.7 }}>({(vivaData[t.id] ?? []).length})</span>
            </button>
          );
        })}
      </div>

      {/* Add new form */}
      {addingNew && (
        <div style={{ ...card, marginBottom: 16, padding: 24, border: `1px solid ${accent}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: accent }}>New Question — {VIVA_TABS.find(t => t.id === vivaTab)?.label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>Question *</label>
              <input style={inputStyle} value={addForm.q} onChange={e => setAddForm(f => ({ ...f, q: e.target.value }))} placeholder="Enter the viva question..." />
            </div>
            <div>
              <label style={labelStyle}>Answer *</label>
              <textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={addForm.a} onChange={e => setAddForm(f => ({ ...f, a: e.target.value }))} placeholder="Enter the answer..." />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveAdd} disabled={savingViva}
                style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: accent, color: "var(--accent-ink)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Save
              </button>
              <button onClick={() => setAddingNew(false)}
                style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions list */}
      {currentQAs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)", border: "1px dashed var(--line)", borderRadius: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎓</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No questions yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Click "Add Question" to get started.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {currentQAs.map((qa, i) => (
            <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", background: "var(--card)", boxShadow: editingIdx === i ? `0 0 0 2px ${accent}` : "none" }}>
              {editingIdx === i ? (
                /* Edit form */
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: accent, marginBottom: 14, letterSpacing: ".04em", textTransform: "uppercase" }}>Editing Q{i + 1}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Question</label>
                      <input style={inputStyle} value={editForm.q} onChange={e => setEditForm(f => ({ ...f, q: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Answer</label>
                      <textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={editForm.a} onChange={e => setEditForm(f => ({ ...f, a: e.target.value }))} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveEdit} disabled={savingViva}
                        style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: accent, color: "var(--accent-ink)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        Save
                      </button>
                      <button onClick={cancelEdit}
                        style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* View row */
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, background: "var(--line)", color: "var(--muted)", padding: "2px 7px", borderRadius: 5, fontWeight: 600, flexShrink: 0 }}>
                          Q{i + 1}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{qa.q}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.7, paddingLeft: 36 }}>{qa.a}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => startEdit(i)} style={{ ...iconBtn, color: accent, borderColor: accent }}
                        title="Edit">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                      </button>
                      <button onClick={() => deleteQA(i)} style={iconBtn} title="Delete">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", display: "flex", flexDirection: "column" }}>

      {/* Top header */}
      <div style={{ borderBottom: "1px solid var(--line)", padding: "0 28px", display: "flex", alignItems: "center", gap: 12, height: 61, background: "var(--card)", position: "sticky", top: 0, zIndex: 10, flexShrink: 0 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line)", background: "var(--paper-2)", textDecoration: "none", color: "var(--ink)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </a>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Admin Dashboard</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{user.email}</div>
        </div>
        <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, background: accent, color: "var(--accent-ink)" }}>Admin</span>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Left nav */}
        <nav style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--line)", background: "var(--card)", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 2, position: "sticky", top: 61, height: "calc(100vh - 61px)", overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", padding: "4px 14px 10px" }}>
            Navigation
          </div>
          <NavLink
            label="Projects"
            active={section === "projects"}
            onClick={() => setSection("projects")}
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>}
          />
          <NavLink
            label="Category Templates"
            active={section === "templates"}
            onClick={() => setSection("templates")}
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="6" width="7" height="3" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="11" width="5" height="2" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>}
          />
          <NavLink
            label="Viva Data"
            active={section === "viva"}
            onClick={() => setSection("viva")}
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
          />
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "36px 32px" }}>
          {section === "projects"  && ProjectsSection}
          {section === "templates" && TemplatesSection}
          {section === "viva"      && VivaSection}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: toast.ok ? "var(--ink)" : "#7B1D1D", color: toast.ok ? "var(--paper)" : "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,.25)", zIndex: 999, whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
