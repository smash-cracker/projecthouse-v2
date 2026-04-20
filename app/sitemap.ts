import type { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

const BASE = "https://www.projecthouse.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const projectUrls: MetadataRoute.Sitemap = (projects ?? []).map((p) => ({
    url: `${BASE}/projects/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/viva`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];

  return [...staticRoutes, ...projectUrls];
}
