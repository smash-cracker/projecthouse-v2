"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AppToaster } from "@/components/ui/AppToaster";
import { TWEAK_DEFAULTS } from "@/lib/data";
import { createClient } from "@/utils/supabase/client";

interface User {
  provider: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
  isAdmin: boolean;
}

interface ProjectHouseState {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  accent: string;
  setAccent: (c: string) => void;
  projects: any[];
  openedProject: any | null;
  setOpenedProject: React.Dispatch<React.SetStateAction<any | null>>;
  searchOpen: boolean;
  setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tweaksVisible: boolean;
  setTweaksVisible: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  authOpen: boolean;
  setAuthOpen: React.Dispatch<React.SetStateAction<boolean>>;
  vivaOpen: boolean;
  setVivaOpen: React.Dispatch<React.SetStateAction<boolean>>;
  signOut: () => void;
}

const ProjectHouseContext = createContext<ProjectHouseState | undefined>(undefined);

function supabaseUserToUser(sbUser: any): User | null {
  if (!sbUser) return null;
  const meta = sbUser.user_metadata ?? {};
  const name = meta.full_name ?? meta.name ?? meta.user_name ?? sbUser.email ?? "User";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    provider: sbUser.app_metadata?.provider ?? "email",
    name,
    email: sbUser.email ?? "",
    handle: meta.user_name ?? meta.preferred_username ?? sbUser.email ?? "",
    avatar: initials,
    isAdmin: sbUser.app_metadata?.role === "admin",
  };
}

// Helper: read a cookie by name on the client
function getClientCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: string }) {
  const [dark, setDark] = useState(initialTheme === "dark");
  const [accent, setAccentState] = useState(TWEAK_DEFAULTS.accent);
  const [projects, setProjects] = useState<any[]>([]);
  const [openedProject, setOpenedProject] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tweaksVisible, setTweaksVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [vivaOpen, setVivaOpen] = useState(false);

  // Sync from cookie on first client render (handles cases where cookie wasn't passed from server)
  useEffect(() => {
    const saved = getClientCookie("ph-theme");
    if (saved) setDark(saved === "dark");
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("projects").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setProjects(data ?? []));
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: sbUser } }) => {
      setUser(supabaseUserToUser(sbUser));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(supabaseUserToUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    // 1-year cookie, readable by the Next.js server on every request
    document.cookie = `ph-theme=${dark ? "dark" : "light"}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }, [dark]);

  useEffect(() => {
    // accent -> CSS var
    document.documentElement.style.setProperty("--accent", accent);
    // compute contrast ink for accent (simple luminance)
    const hex = accent.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16) || 0,
      g = parseInt(hex.slice(2, 4), 16) || 0,
      b = parseInt(hex.slice(4, 6), 16) || 0;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    document.documentElement.style.setProperty(
      "--accent-ink",
      lum > 0.55 ? "#0A0F2C" : "#F3F0E6"
    );
  }, [accent]);

  // ⌘K Support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const setAccent = (c: string) => {
    setAccentState(c);
    try {
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { accent: c } }, "*");
    } catch {}
  };

  const signOut = () => {
    const supabase = createClient();
    supabase.auth.signOut();
  };

  return (
    <ProjectHouseContext.Provider
      value={{
        dark,
        setDark,
        accent,
        setAccent,
        projects,
        openedProject,
        setOpenedProject,
        searchOpen,
        setSearchOpen,
        tweaksVisible,
        setTweaksVisible,
        user,
        setUser,
        authOpen,
        setAuthOpen,
        vivaOpen,
        setVivaOpen,
        signOut,
      }}
    >
      {children}
      <AppToaster />
    </ProjectHouseContext.Provider>
  );
}

export function useProjectHouse() {
  const context = useContext(ProjectHouseContext);
  if (context === undefined) {
    throw new Error("useProjectHouse must be used within a ThemeProvider");
  }
  return context;
}
