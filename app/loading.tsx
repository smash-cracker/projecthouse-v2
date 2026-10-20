export default function Loading() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        background: "var(--paper)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)" }}>
        <span className="spinner" aria-hidden />
        <span
          className="mono"
          style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}
        >
          Loading
        </span>
      </div>
    </main>
  );
}
