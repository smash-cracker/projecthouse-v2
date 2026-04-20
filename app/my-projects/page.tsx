import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "@/components/ui/icons";

export default async function MyProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: payments } = await supabase
    .from("payments")
    .select("*, project:projects(id, title, cat, tag, color, level, stack, rating, files, pages, description)")
    .order("created_at", { ascending: false });

  const items = payments ?? [];

  return (
    <main style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", padding: "48px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <a
            href="/"
            style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}
          >
            ← Back to catalog
          </a>
          <h1 className="serif" style={{ fontSize: "clamp(36px,5vw,64px)", margin: 0, letterSpacing: "-.02em", lineHeight: 1 }}>
            My Projects
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 10 }}>
            {items.length === 0 ? "No purchases yet." : `${items.length} project${items.length !== 1 ? "s" : ""} purchased`}
          </p>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div
            style={{
              border: "1px dashed var(--line)", borderRadius: 16,
              padding: "64px 32px", textAlign: "center",
            }}
          >
            <p style={{ fontSize: 15, color: "var(--muted)", margin: "0 0 20px" }}>
              You haven&apos;t purchased any projects yet.
            </p>
            <a
              href="/#catalog"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: 999,
                background: "var(--ink)", color: "var(--paper)",
                fontFamily: "inherit", fontSize: 14, fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Browse catalog <ArrowUpRight />
            </a>
          </div>
        )}

        {/* Project grid */}
        {items.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {items.map((payment: any) => {
              const proj = payment.project;
              const color = proj?.color ?? "#2A2FB8";
              const paidDate = new Date(payment.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              });

              return (
                <a
                  key={payment.id}
                  href={`/projects/${payment.project_id}`}
                  style={{
                    textDecoration: "none", color: "inherit",
                    border: "1px solid var(--line)", borderRadius: 16,
                    overflow: "hidden", background: "var(--card)",
                    display: "flex", flexDirection: "column",
                  }}
                >
                  {/* Color band */}
                  <div style={{ height: 6, background: color }} />

                  <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Category + level */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {proj?.cat && (
                        <span
                          className="mono"
                          style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: color + "22", color, border: `1px solid ${color}44`, letterSpacing: ".06em", textTransform: "uppercase" }}
                        >
                          {proj.cat}
                        </span>
                      )}
                      {proj?.level && (
                        <span
                          className="mono"
                          style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: "var(--paper)", color: "var(--muted)", border: "1px solid var(--line)" }}
                        >
                          {proj.level}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                      {payment.project_title}
                    </h3>

                    {/* Stack pills */}
                    {proj?.stack?.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {proj.stack.slice(0, 3).map((s: string) => (
                          <span
                            key={s}
                            className="mono"
                            style={{ fontSize: 10, padding: "3px 8px", borderRadius: 999, background: "var(--paper)", border: "1px solid var(--line)", color: "var(--muted)" }}
                          >
                            {s}
                          </span>
                        ))}
                        {proj.stack.length > 3 && (
                          <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>
                            +{proj.stack.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Meta row */}
                    <div style={{ display: "flex", gap: 16, marginTop: "auto", paddingTop: 8 }}>
                      {proj?.files && (
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>{proj.files} files</span>
                      )}
                      {proj?.pages && (
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>{proj.pages} pages</span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      borderTop: "1px solid var(--line)", padding: "12px 20px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Purchased {paidDate}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        ₹{(payment.amount / 100).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11, padding: "4px 10px", borderRadius: 999,
                          background: "#D1FAE5", color: "#065F46",
                          border: "1px solid #6EE7B7",
                          fontWeight: 500,
                        }}
                      >
                        Paid
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Payment ID reference */}
        {items.length > 0 && (
          <div style={{ marginTop: 48, borderTop: "1px solid var(--line)", paddingTop: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Payment history</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((payment: any) => (
                <div
                  key={payment.id}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    flexWrap: "wrap", gap: 8,
                    padding: "12px 16px", borderRadius: 10,
                    border: "1px solid var(--line)", background: "var(--card)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{payment.project_title}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {payment.razorpay_payment_id}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>₹{(payment.amount / 100).toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {new Date(payment.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
