"use client";

import React, { useState, useEffect } from "react";
import { useProjectHouse } from "@/components/providers/ThemeProvider";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { VIVA_TABS } from "@/lib/data";
import { toast } from "sonner";

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
  { label: "Indigo", value: "#2A2FB8" },
  { label: "Deep Navy", value: "#0A0F2C" },
  { label: "Dark Indigo", value: "#1A1F7A" },
  { label: "Peach", value: "#FF8A5C" },
  { label: "Steel Blue", value: "#1E3A5F" },
  { label: "Forest", value: "#1A4731" },
  { label: "Crimson", value: "#7B1D1D" },
  { label: "Teal", value: "#134E4A" },
];

const DEFAULT_TEMPLATES: Record<string, string[]> = {
  ml: ["Full source code", "Cleaned dataset", "Trained model (.pkl)", "Report (PDF)", "README"],
  dl: ["Full source code", "Jupyter notebook", "Pretrained weights", "Training history", "Report (PDF)"],
  cv: ["Full source code", "Jupyter notebook", "Sample images", "Pretrained model", "Report (PDF)"],
  web: ["Full source code", "Database schema", "Deployment guide", "README"],
  mob: ["Full source code", "APK file", "UI assets", "README"],
};

type IncludeItem = { name: string; price: string };
type QA = { id: string; cat: string; question: string; answer: string; order_index: number };
type Bundle = { id: string; title: string; description: string; price: number; project_ids: string[]; color: string; features: string[]; cta: string; featured: boolean; created_at: string };
type Section = "projects" | "templates" | "viva" | "bundles" | "bookings";
type DemoBooking = { id: string; user_id: string; project_id: string; project_title: string; name: string; email: string; slot_date: string; slot_time: string; status: "pending" | "cancelled"; created_at: string };

const EMPTY_FORM = {
  id: "", cat: "ml", title: "", tag: "", price: "", level: "Intermediate",
  stack: "", rating: "4.9", downloads: "0", color: "#2A2FB8",
  desc: "", files: "", pages: "", youtubeLink: "",
};

type Project = { id: string; title: string; tag: string; cat: string; price: number; level: string; color: string; stack: string[]; rating: number; downloads: number; description: string; files: number; pages: number; includes: {name:string;price:number}[]; youtube_link: string | null; created_at: string };

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

  // Projects state
  const [form, setForm] = useState(EMPTY_FORM);
  const [includeItems, setIncludeItems] = useState<IncludeItem[]>(templateToItems(DEFAULT_TEMPLATES.ml));
  const [projects, setProjects] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Templates state
  const [templates, setTemplates] = useState<Record<string, string[]>>(DEFAULT_TEMPLATES);
  const [savingTemplates, setSavingTemplates] = useState(false);

  // Add / edit project dialogs
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Bundles state
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [addBundleOpen, setAddBundleOpen] = useState(false);
  const [editBundle, setEditBundle] = useState<Bundle | null>(null);
  const [bundleForm, setBundleForm] = useState({ id: "", title: "", description: "", price: "", color: "#2A2FB8", project_ids: [] as string[], features: "", cta: "", featured: false });
  const [savingBundle, setSavingBundle] = useState(false);
  const [deletingBundle, setDeletingBundle] = useState<string | null>(null);

  // Bookings state
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsFilter, setBookingsFilter] = useState<"all" | "pending" | "cancelled">("all");
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null);

  // Viva state
  const [vivaRows, setVivaRows] = useState<QA[]>([]);
  const [vivaTab, setVivaTab] = useState("ml");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [addForm, setAddForm] = useState({ question: "", answer: "" });
  const [addingNew, setAddingNew] = useState(false);
  const [savingViva, setSavingViva] = useState(false);
  const [vivaLoading, setVivaLoading] = useState(false);

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
    } catch { }
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { fetchBundles(); }, []);
  useEffect(() => { fetchViva(); }, [vivaTab]);
  useEffect(() => { if (section === "bookings") fetchBookings(); }, [section]);

  async function fetchBookings() {
    setBookingsLoading(true);
    const { data } = await supabase
      .from("demo_bookings")
      .select("*")
      .order("slot_date", { ascending: false })
      .order("slot_time", { ascending: false });
    setBookings(data ?? []);
    setBookingsLoading(false);
  }

  async function handleCancelBooking(id: string) {
    setCancellingBooking(id);
    const { error } = await supabase.from("demo_bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) showToast("❌ " + error.message, false);
    else { showToast("Booking cancelled"); fetchBookings(); }
    setCancellingBooking(null);
  }

  async function fetchProjects() {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProjects(data);
  }

  function showToast(msg: string, ok = true) {
    if (ok) toast.success(msg);
    else toast.error(msg);
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

  function handleItemPriceChange(i: number, rawValue: string) {
    const total = parseInt(form.price) || 0;
    setIncludeItems((prev) => {
      const updated = prev.map((item, idx) => idx === i ? { ...item, price: rawValue } : item);
      const assignedSum = updated.reduce((sum, item, idx) =>
        idx === i || parseInt(item.price) > 0 ? sum + (parseInt(item.price) || 0) : sum, 0);
      const remaining = Math.max(0, total - assignedSum);
      const freeIdxs = updated.reduce<number[]>((acc, item, idx) => {
        if (idx !== i && (parseInt(item.price) || 0) === 0) acc.push(idx);
        return acc;
      }, []);
      if (freeIdxs.length === 0 || remaining === 0) return updated;
      const share = Math.floor(remaining / freeIdxs.length);
      const extra = remaining - share * freeIdxs.length;
      return updated.map((item, idx) => {
        if (!freeIdxs.includes(idx)) return item;
        return { ...item, price: String(share + (freeIdxs[0] === idx ? extra : 0)) };
      });
    });
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
      showToast(" Project added!");
      setForm(EMPTY_FORM);
      setIncludeItems(templateToItems(templates[EMPTY_FORM.cat] ?? []));
      fetchProjects();
    } catch (err: any) {
      showToast("❌ " + (err.message ?? "Something went wrong"), false);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editProject) return;
    if (includeItems.some((i) => !i.name.trim())) {
      showToast("❌ All include items need a name", false); return;
    }
    setSaving(true);
    try {
      const payload = {
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
      const { error } = await supabase.from("projects").update(payload).eq("id", editProject.id);
      if (error) throw error;
      showToast(" Project updated!");
      setEditProject(null);
      setForm(EMPTY_FORM);
      setIncludeItems(templateToItems(templates[EMPTY_FORM.cat] ?? []));
      fetchProjects();
    } catch (err: any) {
      showToast("❌ " + (err.message ?? "Something went wrong"), false);
    } finally {
      setSaving(false);
    }
  }

  function openEdit(p: Project) {
    setForm({
      id: p.id, cat: p.cat, title: p.title, tag: p.tag,
      price: String(p.price), level: p.level, stack: p.stack.join(", "),
      rating: String(p.rating), downloads: String(p.downloads),
      color: p.color, desc: p.description,
      files: String(p.files), pages: String(p.pages),
      youtubeLink: p.youtube_link ?? "",
    });
    setIncludeItems(p.includes.map(i => ({ name: i.name, price: String(i.price) })));
    setEditProject(p);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) showToast("❌ " + error.message, false);
    else { showToast("🗑 Project deleted"); fetchProjects(); }
    setDeleting(null);
  }

  // ── Bundles ─────────────────────────────────────────────────────────────────

  async function fetchBundles() {
    setBundlesLoading(true);
    const { data } = await supabase.from("bundles").select("*").order("created_at", { ascending: false });
    setBundles(data ?? []);
    setBundlesLoading(false);
  }

  function bundleField(key: keyof typeof bundleForm, value: string) {
    setBundleForm((f) => ({ ...f, [key]: value }));
  }

  function toggleBundleProject(id: string) {
    setBundleForm((f) => ({
      ...f,
      project_ids: f.project_ids.includes(id) ? f.project_ids.filter((x) => x !== id) : [...f.project_ids, id],
    }));
  }

  function resetBundleForm() {
    setBundleForm({ id: "", title: "", description: "", price: "", color: "#2A2FB8", project_ids: [], features: "", cta: "", featured: false });
  }

  async function handleAddBundle(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingBundle(true);
    try {
      const payload = {
        id: bundleForm.id || "b" + Date.now().toString().slice(-6),
        title: bundleForm.title,
        description: bundleForm.description,
        price: parseInt(bundleForm.price) || 0,
        project_ids: bundleForm.project_ids,
        color: bundleForm.color,
        features: bundleForm.features.split("\n").map(f => f.trim()).filter(Boolean),
        cta: bundleForm.cta,
        featured: bundleForm.featured,
      };
      const { error } = await supabase.from("bundles").insert(payload);
      if (error) throw error;
      showToast(" Bundle added!");
      resetBundleForm();
      setAddBundleOpen(false);
      fetchBundles();
    } catch (err: any) {
      showToast("❌ " + (err.message ?? "Something went wrong"), false);
    } finally {
      setSavingBundle(false);
    }
  }

  async function handleUpdateBundle(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editBundle) return;
    setSavingBundle(true);
    try {
      const payload = {
        title: bundleForm.title,
        description: bundleForm.description,
        price: parseInt(bundleForm.price) || 0,
        project_ids: bundleForm.project_ids,
        color: bundleForm.color,
        features: bundleForm.features.split("\n").map(f => f.trim()).filter(Boolean),
        cta: bundleForm.cta,
        featured: bundleForm.featured,
      };
      const { error } = await supabase.from("bundles").update(payload).eq("id", editBundle.id);
      if (error) throw error;
      showToast(" Bundle updated!");
      setEditBundle(null);
      resetBundleForm();
      fetchBundles();
    } catch (err: any) {
      showToast("❌ " + (err.message ?? "Something went wrong"), false);
    } finally {
      setSavingBundle(false);
    }
  }

  async function handleDeleteBundle(id: string) {
    setDeletingBundle(id);
    const { error } = await supabase.from("bundles").delete().eq("id", id);
    if (error) showToast("❌ " + error.message, false);
    else { showToast("🗑 Bundle deleted"); fetchBundles(); }
    setDeletingBundle(null);
  }

  function openEditBundle(b: Bundle) {
    setBundleForm({ 
      id: b.id, 
      title: b.title, 
      description: b.description, 
      price: String(b.price), 
      color: b.color, 
      project_ids: b.project_ids || [],
      features: (b.features || []).join("\n"),
      cta: b.cta || "",
      featured: b.featured ?? false
    });
    setEditBundle(b);
  }

  // ── Templates ───────────────────────────────────────────────────────────────

  function saveTemplates() {
    setSavingTemplates(true);
    try {
      localStorage.setItem("admin_cat_templates", JSON.stringify(templates));
      showToast(" Templates saved!");
    } catch { showToast("❌ Failed to save", false); }
    finally { setSavingTemplates(false); }
  }

  // ── Viva ─────────────────────────────────────────────────────────────────────

  async function fetchViva() {
    setVivaLoading(true);
    const { data } = await supabase
      .from("viva_qa")
      .select("id, cat, question, answer, order_index")
      .eq("cat", vivaTab)
      .order("order_index", { ascending: true });
    setVivaRows(data ?? []);
    setVivaLoading(false);
  }

  function startEdit(row: QA) {
    setEditingId(row.id);
    setEditForm({ question: row.question, answer: row.answer });
    setAddingNew(false);
  }

  function cancelEdit() { setEditingId(null); }

  async function saveEdit() {
    if (!editForm.question.trim() || !editForm.answer.trim()) {
      showToast("❌ Question and answer are required", false); return;
    }
    setSavingViva(true);
    const { error } = await supabase
      .from("viva_qa")
      .update({ question: editForm.question, answer: editForm.answer })
      .eq("id", editingId);
    setSavingViva(false);
    if (error) { showToast("❌ " + error.message, false); return; }
    setEditingId(null);
    showToast("Question updated!");
    fetchViva();
  }

  async function deleteQA(id: string) {
    const { error } = await supabase.from("viva_qa").delete().eq("id", id);
    if (error) { showToast("❌ " + error.message, false); return; }
    showToast("Question deleted");
    fetchViva();
  }

  async function saveAdd() {
    if (!addForm.question.trim() || !addForm.answer.trim()) {
      showToast("❌ Question and answer are required", false); return;
    }
    setSavingViva(true);
    const { error } = await supabase.from("viva_qa").insert({
      cat: vivaTab,
      question: addForm.question,
      answer: addForm.answer,
      order_index: vivaRows.length,
    });
    setSavingViva(false);
    if (error) { showToast("❌ " + error.message, false); return; }
    setAddForm({ question: "", answer: "" });
    setAddingNew(false);
    showToast(" Question added!");
    fetchViva();
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

  const AddProjectDialog = addProjectOpen && (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "var(--paper)", display: "flex", flexDirection: "column" }}>
      {/* Dialog header */}
      <div style={{ borderBottom: "1px solid var(--line)", padding: "0 28px", height: 61, display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: "var(--card)" }}>
        <button onClick={() => setAddProjectOpen(false)} style={{ ...iconBtn, width: 34, height: 34 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Add New Project</div>
      </div>

      {/* Dialog body */}
      <div className="scroll" style={{ flex: 1, overflowY: "auto", padding: "36px 32px", maxWidth: 780, width: "100%", margin: "0 auto" }}>
        <form onSubmit={async (e) => { await handleSubmit(e); setAddProjectOpen(false); }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

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
                  <input type="number" min="0" style={{ ...inputStyle, fontSize: 13 }} value={item.price} onChange={e => handleItemPriceChange(i, e.target.value)} placeholder="0" />
                  <button type="button" onClick={() => setIncludeItems(p => p.filter((_, idx) => idx !== i))} style={iconBtn} title="Remove">
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setIncludeItems(p => [...p, { name: "", price: "0" }])}
              style={{ marginTop: 10, padding: "8px 14px", borderRadius: 8, border: "1px dashed var(--line)", background: "transparent", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
              + Add item
            </button>
            {(() => {
              const total = parseInt(form.price) || 0;
              const assigned = includeItems.reduce((s, it) => s + (parseInt(it.price) || 0), 0);
              const diff = total - assigned;
              const over = diff < 0;
              const exact = diff === 0 && total > 0;
              return (
                <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: over ? "#7B1D1D18" : exact ? "#14532D18" : "var(--paper-2)", border: `1px solid ${over ? "#7B1D1D44" : exact ? "#14532D44" : "var(--line)"}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "var(--muted)" }}>
                    {exact ? "✓ Adds up to project price" : over ? `₹${Math.abs(diff).toLocaleString("en-IN")} over project price` : `₹${Math.abs(diff).toLocaleString("en-IN")} unassigned`}
                  </span>
                  <span style={{ fontWeight: 700, color: over ? "#DC2626" : exact ? "#16A34A" : "var(--ink)" }}>
                    ₹{assigned.toLocaleString("en-IN")} / ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })()}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            {[["files", "Files", "38"], ["pages", "Pages", "62"], ["rating", "Rating", "4.9"], ["downloads", "Downloads", "0"]].map(([k, lbl, ph]) => (
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

          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            <button type="submit" disabled={saving}
              style={{ padding: "14px 28px", borderRadius: 12, border: "none", background: saving ? "var(--muted)" : accent, color: "var(--accent-ink)", fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {saving ? "Saving..." : "Add Project"}
            </button>
            <button type="button" onClick={() => setAddProjectOpen(false)}
              style={{ padding: "14px 20px", borderRadius: 12, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditProjectDialog = editProject && (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "var(--paper)", display: "flex", flexDirection: "column" }}>
      <div style={{ borderBottom: "1px solid var(--line)", padding: "0 28px", height: 61, display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: "var(--card)" }}>
        <button onClick={() => { setEditProject(null); setForm(EMPTY_FORM); setIncludeItems(templateToItems(templates[EMPTY_FORM.cat] ?? [])); }} style={{ ...iconBtn, width: 34, height: 34 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Edit Project <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 400, marginLeft: 6 }}>{editProject.id}</span></div>
      </div>
      <div className="scroll" style={{ flex: 1, overflowY: "auto", padding: "36px 32px", maxWidth: 780, width: "100%", margin: "0 auto" }}>
        <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><label style={labelStyle}>Title *</label><input required style={inputStyle} value={form.title} onChange={e => field("title", e.target.value)} /></div>
            <div><label style={labelStyle}>ID</label><input style={{ ...inputStyle, opacity: 0.5 }} value={form.id} readOnly /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><label style={labelStyle}>Category *</label>
              <select required style={inputStyle} value={form.cat} onChange={e => handleCategoryChange(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Level *</label>
              <select required style={inputStyle} value={form.level} onChange={e => field("level", e.target.value)}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><label style={labelStyle}>Tag / Subtitle *</label><input required style={inputStyle} value={form.tag} onChange={e => field("tag", e.target.value)} /></div>
            <div><label style={labelStyle}>Price (₹) *</label><input required type="number" style={inputStyle} value={form.price} onChange={e => field("price", e.target.value)} /></div>
          </div>
          <div><label style={labelStyle}>Description *</label><textarea required rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.desc} onChange={e => field("desc", e.target.value)} /></div>
          <div><label style={labelStyle}>Tech Stack (comma-separated) *</label><input required style={inputStyle} value={form.stack} onChange={e => field("stack", e.target.value)} /></div>
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
                  <input style={{ ...inputStyle, fontSize: 13 }} value={item.name} onChange={e => setItem(i, { name: e.target.value })} />
                  <input type="number" min="0" style={{ ...inputStyle, fontSize: 13 }} value={item.price} onChange={e => handleItemPriceChange(i, e.target.value)} />
                  <button type="button" onClick={() => setIncludeItems(p => p.filter((_, idx) => idx !== i))} style={iconBtn}>
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setIncludeItems(p => [...p, { name: "", price: "0" }])}
              style={{ marginTop: 10, padding: "8px 14px", borderRadius: 8, border: "1px dashed var(--line)", background: "transparent", color: "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
              + Add item
            </button>
            {(() => {
              const total = parseInt(form.price) || 0;
              const assigned = includeItems.reduce((s, it) => s + (parseInt(it.price) || 0), 0);
              const diff = total - assigned;
              const over = diff < 0;
              const exact = diff === 0 && total > 0;
              return (
                <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: over ? "#7B1D1D18" : exact ? "#14532D18" : "var(--paper-2)", border: `1px solid ${over ? "#7B1D1D44" : exact ? "#14532D44" : "var(--line)"}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "var(--muted)" }}>
                    {exact ? "✓ Adds up to project price" : over ? `₹${Math.abs(diff).toLocaleString("en-IN")} over project price` : `₹${Math.abs(diff).toLocaleString("en-IN")} unassigned`}
                  </span>
                  <span style={{ fontWeight: 700, color: over ? "#DC2626" : exact ? "#16A34A" : "var(--ink)" }}>
                    ₹{assigned.toLocaleString("en-IN")} / ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })()}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            {[["files","Files"],["pages","Pages"],["rating","Rating"],["downloads","Downloads"]].map(([k, lbl]) => (
              <div key={k}><label style={labelStyle}>{lbl}</label>
                <input type="number" step={k === "rating" ? "0.1" : "1"} min="0" max={k === "rating" ? "5" : undefined}
                  style={inputStyle} value={(form as any)[k]} onChange={e => field(k as any, e.target.value)} />
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><label style={labelStyle}>Card Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLORS.map(c => (
                  <button key={c.value} type="button" title={c.label} onClick={() => field("color", c.value)}
                    style={{ width: 28, height: 28, borderRadius: 8, background: c.value, border: form.color === c.value ? "2px solid var(--ink)" : "2px solid transparent", cursor: "pointer" }} />
                ))}
              </div>
            </div>
            <div><label style={labelStyle}>YouTube Link</label><input style={inputStyle} value={form.youtubeLink} onChange={e => field("youtubeLink", e.target.value)} placeholder="https://youtu.be/..." /></div>
          </div>
          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            <button type="submit" disabled={saving}
              style={{ padding: "14px 28px", borderRadius: 12, border: "none", background: saving ? "var(--muted)" : accent, color: "var(--accent-ink)", fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => { setEditProject(null); setForm(EMPTY_FORM); setIncludeItems(templateToItems(templates[EMPTY_FORM.cat] ?? [])); }}
              style={{ padding: "14px 20px", borderRadius: 12, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const BundleFormFields = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input required style={inputStyle} value={bundleForm.title} onChange={e => bundleField("title", e.target.value)} placeholder="Final Year AI Bundle" />
        </div>
        <div>
          <label style={labelStyle}>ID (auto if blank)</label>
          <input style={inputStyle} value={bundleForm.id} onChange={e => bundleField("id", e.target.value)} placeholder="b01" />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Description</label>
        <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={bundleForm.description} onChange={e => bundleField("description", e.target.value)} placeholder="Short description of what's in this bundle..." />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>Bundle Price (₹) *</label>
          <input required type="number" style={inputStyle} value={bundleForm.price} onChange={e => bundleField("price", e.target.value)} placeholder="2999" />
        </div>
        <div>
          <label style={labelStyle}>Card Color</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
            {COLORS.map(c => (
              <button key={c.value} type="button" title={c.label} onClick={() => bundleField("color", c.value)}
                style={{ width: 28, height: 28, borderRadius: 8, background: c.value, border: bundleForm.color === c.value ? "2px solid var(--ink)" : "2px solid transparent", cursor: "pointer" }} />
            ))}
          </div>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Projects in Bundle</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
          {projects.map(p => {
            const checked = bundleForm.project_ids.includes(p.id);
            return (
              <div key={p.id} onClick={() => toggleBundleProject(p.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: `1px solid ${checked ? "var(--ink)" : "var(--line)"}`, background: checked ? "var(--card)" : "transparent", cursor: "pointer", transition: "all .15s" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: checked ? 600 : 400 }}>{p.title}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>₹{p.price.toLocaleString("en-IN")}</span>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `1px solid ${checked ? accent : "var(--line)"}`, background: checked ? accent : "transparent", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {checked && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
              </div>
            );
          })}
        </div>
        {bundleForm.project_ids.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
            {bundleForm.project_ids.length} project{bundleForm.project_ids.length !== 1 ? "s" : ""} selected ·{" "}
            full price ₹{projects.filter(p => bundleForm.project_ids.includes(p.id)).reduce((s, p) => s + p.price, 0).toLocaleString("en-IN")}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>CTA Text</label>
          <input style={inputStyle} value={bundleForm.cta} onChange={e => bundleField("cta", e.target.value)} placeholder="Get the pack" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 24 }}>
          <input type="checkbox" id="bundle-featured" checked={bundleForm.featured} onChange={e => setBundleForm(f => ({ ...f, featured: e.target.checked }))} />
          <label htmlFor="bundle-featured" style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}>Featured / Highlighted</label>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Features (one per line)</label>
        <textarea rows={6} style={{ ...inputStyle, resize: "vertical" }} value={bundleForm.features} onChange={e => bundleField("features", e.target.value)} placeholder="Any 3 projects&#10;Full source code&#10;30-day support..." />
      </div>
    </div>
  );

  const AddBundleDialog = addBundleOpen && (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "var(--paper)", display: "flex", flexDirection: "column" }}>
      <div style={{ borderBottom: "1px solid var(--line)", padding: "0 28px", height: 61, display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: "var(--card)" }}>
        <button onClick={() => { setAddBundleOpen(false); resetBundleForm(); }} style={{ ...iconBtn, width: 34, height: 34 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Add New Bundle</div>
      </div>
      <div className="scroll" style={{ flex: 1, overflowY: "auto", padding: "36px 32px", maxWidth: 780, width: "100%", margin: "0 auto" }}>
        <form onSubmit={handleAddBundle} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {BundleFormFields}
          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            <button type="submit" disabled={savingBundle}
              style={{ padding: "14px 28px", borderRadius: 12, border: "none", background: savingBundle ? "var(--muted)" : accent, color: "var(--accent-ink)", fontSize: 15, fontWeight: 700, cursor: savingBundle ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {savingBundle ? "Saving..." : "Add Bundle"}
            </button>
            <button type="button" onClick={() => { setAddBundleOpen(false); resetBundleForm(); }}
              style={{ padding: "14px 20px", borderRadius: 12, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditBundleDialog = editBundle && (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "var(--paper)", display: "flex", flexDirection: "column" }}>
      <div style={{ borderBottom: "1px solid var(--line)", padding: "0 28px", height: 61, display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: "var(--card)" }}>
        <button onClick={() => { setEditBundle(null); resetBundleForm(); }} style={{ ...iconBtn, width: 34, height: 34 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Edit Bundle <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 400, marginLeft: 6 }}>{editBundle.id}</span></div>
      </div>
      <div className="scroll" style={{ flex: 1, overflowY: "auto", padding: "36px 32px", maxWidth: 780, width: "100%", margin: "0 auto" }}>
        <form onSubmit={handleUpdateBundle} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {BundleFormFields}
          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            <button type="submit" disabled={savingBundle}
              style={{ padding: "14px 28px", borderRadius: 12, border: "none", background: savingBundle ? "var(--muted)" : accent, color: "var(--accent-ink)", fontSize: 15, fontWeight: 700, cursor: savingBundle ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {savingBundle ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => { setEditBundle(null); resetBundleForm(); }}
              style={{ padding: "14px 20px", borderRadius: 12, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const BundlesSection = (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Bundles <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 400 }}>({bundles.length})</span></h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Group projects into discounted bundles.</p>
        </div>
        <button onClick={() => setAddBundleOpen(true)}
          style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: accent, color: "var(--accent-ink)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          + Add Bundle
        </button>
      </div>

      {bundlesLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)", fontSize: 13 }}>Loading…</div>
      ) : bundles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)", border: "1px dashed var(--line)", borderRadius: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎁</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No bundles yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Click "Add Bundle" to get started.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bundles.map(b => {
            const bundledProjects = projects.filter(p => b.project_ids.includes(p.id));
            const fullPrice = bundledProjects.reduce((s, p) => s + p.price, 0);
            return (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--line)" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    {b.project_ids.length} project{b.project_ids.length !== 1 ? "s" : ""} · ₹{b.price.toLocaleString("en-IN")}
                    {fullPrice > b.price && <span style={{ marginLeft: 6, textDecoration: "line-through", opacity: 0.5 }}>₹{fullPrice.toLocaleString("en-IN")}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                  <span className="mono" style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "var(--paper-2)", color: "var(--muted)" }}>{b.id}</span>
                  <button onClick={() => openEditBundle(b)} style={{ ...iconBtn, color: accent, borderColor: accent }} title="Edit">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                  </button>
                  <button onClick={() => handleDeleteBundle(b.id)} disabled={deletingBundle === b.id} style={iconBtn} title="Delete">
                    {deletingBundle === b.id ? "…" : <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const ProjectsSection = (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Projects <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 400 }}>({projects.length})</span></h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>All projects in Supabase.</p>
        </div>
        <button onClick={() => setAddProjectOpen(true)}
          style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: accent, color: "var(--accent-ink)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          + Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)", border: "1px dashed var(--line)", borderRadius: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No projects yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Click "Add Project" to get started.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {projects.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--line)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {CATEGORIES.find(c => c.id === p.cat)?.label} · ₹{p.price.toLocaleString("en-IN")} · {p.level}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "var(--paper-2)", color: "var(--muted)" }}>{p.id}</span>
                <button onClick={() => openEdit(p)} style={{ ...iconBtn, color: accent, borderColor: accent }} title="Edit">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} style={iconBtn} title="Delete">
                  {deleting === p.id ? "…" : <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
                      <svg width="9" height="9" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
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

  const filteredBookings = bookings.filter(b => bookingsFilter === "all" || b.status === bookingsFilter);

  const BookingsSection = (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Demo Bookings <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 400 }}>({bookings.length})</span></h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>All demo session bookings.</p>
        </div>
        <button onClick={fetchBookings} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid var(--line)", background: "transparent", color: "var(--ink)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {(["all", "pending", "cancelled"] as const).map(f => (
          <button key={f} onClick={() => setBookingsFilter(f)}
            style={{ padding: "7px 16px", borderRadius: 999, border: "1px solid var(--line)", fontFamily: "inherit", fontSize: 13, fontWeight: bookingsFilter === f ? 600 : 400, cursor: "pointer", background: bookingsFilter === f ? accent : "var(--card)", color: bookingsFilter === f ? "var(--accent-ink)" : "var(--ink)", textTransform: "capitalize" }}>
            {f}
          </button>
        ))}
      </div>

      {bookingsLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)", fontSize: 13 }}>Loading…</div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)", border: "1px dashed var(--line)", borderRadius: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No bookings</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>No {bookingsFilter === "all" ? "" : bookingsFilter + " "}demo bookings found.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredBookings.map(b => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "var(--card)", border: "1px solid var(--line)", opacity: b.status === "cancelled" ? 0.6 : 1 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.project_title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {b.name} · {b.email}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{b.slot_date} · {b.slot_time}</span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", background: b.status === "pending" ? "#14532D22" : "var(--paper-2)", color: b.status === "pending" ? "#16A34A" : "var(--muted)" }}>
                  {b.status}
                </span>
              </div>
              {b.status === "pending" && (
                <button onClick={() => handleCancelBooking(b.id)} disabled={cancellingBooking === b.id} style={{ ...iconBtn, flexShrink: 0 }} title="Cancel booking">
                  {cancellingBooking === b.id ? "…" : <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const VivaSection = (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Viva Data</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Manage viva prep questions per category.</p>
        </div>
        <button
          onClick={() => { setAddingNew(true); setEditingId(null); setAddForm({ question: "", answer: "" }); }}
          style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: accent, color: "var(--accent-ink)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          + Add Question
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {VIVA_TABS.map(t => {
          const active = vivaTab === t.id;
          return (
            <button key={t.id} onClick={() => { setVivaTab(t.id); setEditingId(null); setAddingNew(false); }}
              style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid var(--line)", fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", background: active ? accent : "var(--card)", color: active ? "var(--accent-ink)" : "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{t.icon}</span> {t.label}
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
              <input style={inputStyle} value={addForm.question} onChange={e => setAddForm(f => ({ ...f, question: e.target.value }))} placeholder="Enter the viva question..." />
            </div>
            <div>
              <label style={labelStyle}>Answer *</label>
              <textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={addForm.answer} onChange={e => setAddForm(f => ({ ...f, answer: e.target.value }))} placeholder="Enter the answer..." />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveAdd} disabled={savingViva}
                style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: accent, color: "var(--accent-ink)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {savingViva ? "Saving…" : "Save"}
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
      {vivaLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)", fontSize: 13 }}>Loading…</div>
      ) : vivaRows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)", border: "1px dashed var(--line)", borderRadius: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎓</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No questions yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Click "Add Question" to get started.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {vivaRows.map((qa, i) => (
            <div key={qa.id} style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", background: "var(--card)", boxShadow: editingId === qa.id ? `0 0 0 2px ${accent}` : "none" }}>
              {editingId === qa.id ? (
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: accent, marginBottom: 14, letterSpacing: ".04em", textTransform: "uppercase" }}>Editing Q{i + 1}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Question</label>
                      <input style={inputStyle} value={editForm.question} onChange={e => setEditForm(f => ({ ...f, question: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Answer</label>
                      <textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={editForm.answer} onChange={e => setEditForm(f => ({ ...f, answer: e.target.value }))} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveEdit} disabled={savingViva}
                        style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: accent, color: "var(--accent-ink)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        {savingViva ? "Saving…" : "Save"}
                      </button>
                      <button onClick={cancelEdit}
                        style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, background: "var(--line)", color: "var(--muted)", padding: "2px 7px", borderRadius: 5, fontWeight: 600, flexShrink: 0 }}>Q{i + 1}</span>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{qa.question}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", lineHeight: 1.7, paddingLeft: 36 }}>{qa.answer}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => startEdit(qa)} style={{ ...iconBtn, color: accent, borderColor: accent }} title="Edit">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                      </button>
                      <button onClick={() => deleteQA(qa.id)} style={iconBtn} title="Delete">
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
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
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" /></svg>}
          />
          <NavLink
            label="Category Templates"
            active={section === "templates"}
            onClick={() => setSection("templates")}
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="1" y="6" width="7" height="3" rx="1" stroke="currentColor" strokeWidth="1.4" /><rect x="1" y="11" width="5" height="2" rx="1" stroke="currentColor" strokeWidth="1.4" /></svg>}
          />
          <NavLink
            label="Bundles"
            active={section === "bundles"}
            onClick={() => setSection("bundles")}
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M4 4V3a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
          />
          <NavLink
            label="Viva Data"
            active={section === "viva"}
            onClick={() => setSection("viva")}
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" /><path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>}
          />
          <NavLink
            label="Demo Bookings"
            active={section === "bookings"}
            onClick={() => setSection("bookings")}
            icon={<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M4 1v4M10 1v4M1 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
          />
        </nav>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "36px 32px" }}>
          {section === "projects" && ProjectsSection}
          {section === "bundles" && BundlesSection}
          {section === "templates" && TemplatesSection}
          {section === "viva" && VivaSection}
          {section === "bookings" && BookingsSection}
        </main>
      </div>

      {AddProjectDialog}
      {EditProjectDialog}
      {AddBundleDialog}
      {EditBundleDialog}
    </div>
  );
}
