"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

// The app state is split across four contexts so a change to one slice only
// re-renders the components that actually read it. Before this, every modal
// toggle produced a new combined context value and re-rendered the whole page
// (including all catalog cards).

type SetDark = React.Dispatch<React.SetStateAction<boolean>>;
type SetBoolean = React.Dispatch<React.SetStateAction<boolean>>;
type SetProject = React.Dispatch<React.SetStateAction<any | null>>;

interface ThemeState {
  dark: boolean;
  setDark: SetDark;
  accent: string;
  setAccent: (c: string) => void;
}

interface AuthState {
  user: User | null;
  authOpen: boolean;
  setAuthOpen: SetBoolean;
  signOut: () => void;
  purchasedProjectIds: string[];
  refreshPurchases: () => void;
}

interface UIState {
  openedProject: any | null;
  searchOpen: boolean;
  tweaksVisible: boolean;
}

interface UIActions {
  setOpenedProject: SetProject;
  setSearchOpen: SetBoolean;
  setTweaksVisible: SetBoolean;
}

const ThemeContext = createContext<ThemeState | undefined>(undefined);
const AuthContext = createContext<AuthState | undefined>(undefined);
const UIContext = createContext<UIState | undefined>(undefined);
const UIActionsContext = createContext<UIActions | undefined>(undefined);

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

function getClientCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dark, setDark] = useState(false);
  const [accent, setAccentState] = useState(TWEAK_DEFAULTS.accent);
  const [openedProject, setOpenedProject] = useState<any | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tweaksVisible, setTweaksVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [purchasedProjectIds, setPurchasedProjectIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = getClientCookie("ph-theme");
    if (saved) setDark(saved === "dark");
  }, []);

  const fetchPurchases = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("payments").select("project_id");
    setPurchasedProjectIds((data ?? []).map((r: any) => r.project_id).filter(Boolean));
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: sbUser } }) => {
      setUser(supabaseUserToUser(sbUser));
      if (sbUser) fetchPurchases();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(supabaseUserToUser(session?.user ?? null));
      if (session?.user) {
        fetchPurchases();
      } else {
        setPurchasedProjectIds([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchPurchases]);

  // The root layout's inline script has already applied the saved theme before
  // paint. Skip the first run so hydration doesn't reset it (or rewrite the
  // cookie); only persist genuine user toggles.
  const themeReady = useRef(false);
  useEffect(() => {
    if (!themeReady.current) { themeReady.current = true; return; }
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.cookie = `ph-theme=${dark ? "dark" : "light"}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }, [dark]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
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

  const setAccent = useCallback((c: string) => {
    setAccentState(c);
    try {
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { accent: c } }, "*");
    } catch {}
  }, []);

  const signOut = useCallback(() => {
    const supabase = createClient();
    supabase.auth.signOut();
  }, []);

  const themeValue = useMemo<ThemeState>(
    () => ({ dark, setDark, accent, setAccent }),
    [dark, accent, setAccent]
  );

  const authValue = useMemo<AuthState>(
    () => ({ user, authOpen, setAuthOpen, signOut, purchasedProjectIds, refreshPurchases: fetchPurchases }),
    [user, authOpen, signOut, purchasedProjectIds, fetchPurchases]
  );

  const uiValue = useMemo<UIState>(
    () => ({ openedProject, searchOpen, tweaksVisible }),
    [openedProject, searchOpen, tweaksVisible]
  );

  // Setters from useState are stable, so this value never changes.
  const uiActions = useMemo<UIActions>(
    () => ({ setOpenedProject, setSearchOpen, setTweaksVisible }),
    []
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <AuthContext.Provider value={authValue}>
        <UIContext.Provider value={uiValue}>
          <UIActionsContext.Provider value={uiActions}>
            {children}
            <AppToaster />
          </UIActionsContext.Provider>
        </UIContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a ThemeProvider");
  }
  return context;
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a ThemeProvider");
  }
  return context;
}

export function useUIActions() {
  const context = useContext(UIActionsContext);
  if (context === undefined) {
    throw new Error("useUIActions must be used within a ThemeProvider");
  }
  return context;
}
