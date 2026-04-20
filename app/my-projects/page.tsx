import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "@/components/ui/icons";
import { MyProjectsGrid } from "./MyProjectsGrid";

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
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

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
          <div style={{ border: "1px dashed var(--line)", borderRadius: 16, padding: "64px 32px", textAlign: "center" }}>
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

        {/* Project grid — same card UI as catalog */}
        {items.length > 0 && <MyProjectsGrid payments={items} />}

        {/* Payment history */}
        {items.length > 0 && (
          <div style={{ marginTop: 56, borderTop: "1px solid var(--line)", paddingTop: 32 }}>
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
