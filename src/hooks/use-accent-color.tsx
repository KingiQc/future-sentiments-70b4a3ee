import { useEffect } from "react";
import { useAuth } from "./use-auth";
import { supabase } from "@/integrations/supabase/client";

const ACCENT_KEY = "app_accent_color";
const DEFAULT_ACCENT = "27 76% 60%";

export function getAccentColor(): string {
  return localStorage.getItem(ACCENT_KEY) || DEFAULT_ACCENT;
}

export function applyAccentColor(hsl: string) {
  const root = document.documentElement;
  root.style.setProperty("--primary", hsl);
  root.style.setProperty("--accent", hsl);
  root.style.setProperty("--ring", hsl);
  root.style.setProperty("--sidebar-primary", hsl);
  root.style.setProperty("--sidebar-ring", hsl);
  root.style.setProperty("--letter-accent", hsl);
  localStorage.setItem(ACCENT_KEY, hsl);
}

export async function saveAccentColor(hsl: string, userId?: string) {
  applyAccentColor(hsl);
  if (userId) {
    await supabase.from("profiles").update({ accent_color: hsl }).eq("user_id", userId);
  }
}

export function useAccentColor() {
  const { profile } = useAuth();

  useEffect(() => {
    const color = profile?.accent_color || getAccentColor();
    applyAccentColor(color);
  }, [profile?.accent_color]);
}

// Preset colors for quick selection
export const ACCENT_PRESETS = [
  { name: "Orange", hsl: "27 76% 60%" },
  { name: "Blue", hsl: "217 91% 60%" },
  { name: "Purple", hsl: "262 83% 58%" },
  { name: "Pink", hsl: "330 81% 60%" },
  { name: "Green", hsl: "142 71% 45%" },
  { name: "Red", hsl: "0 84% 60%" },
  { name: "Teal", hsl: "174 72% 46%" },
  { name: "Yellow", hsl: "45 93% 47%" },
];
