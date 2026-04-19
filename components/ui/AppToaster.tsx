"use client";

import { Toaster } from "sonner";
import { useProjectHouse } from "@/components/providers/ThemeProvider";

export function AppToaster() {
  const { dark } = useProjectHouse();

  return (
    <Toaster
      theme={dark ? "dark" : "light"}
      position="bottom-center"
      toastOptions={{
        style: {
          background: "var(--card)",
          color: "var(--ink)",
          border: "1px solid var(--line)",
          borderRadius: 12,
          fontSize: 14,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          boxShadow: "0 8px 32px rgba(0,0,0,.12)",
        },
      }}
    />
  );
}
