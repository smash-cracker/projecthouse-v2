"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { TWEAK_DEFAULTS } from "@/lib/data";

interface User {
  provider: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
}

interface ProjectHouseState {
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  accent: string;
  setAccent: (c: string) => void;
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
  signOut: () => void;
}

const ProjectHouseContext = createContext<ProjectHouseState | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [accent, setAccentState] = useState(TWEAK_DEFAULTS.accent);
  const [openedProject, setOpenedProject] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tweaksVisible, setTweaksVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem("ph-theme");
    if (s) setDark(s === "dark");
    const u = localStorage.getItem("ph-user");
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {}
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("ph-theme", dark ? "dark" : "light");
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
    setUser(null);
    localStorage.removeItem("ph-user");
  };

  return (
    <ProjectHouseContext.Provider
      value={{
        dark,
        setDark,
        accent,
        setAccent,
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
        signOut,
      }}
    >
      {children}
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
