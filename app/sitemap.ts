import type { MetadataRoute } from "next";
import { createPublicClient } from "@/utils/supabase/public";

const BASE = "https://www.projecthouse.in";

// Sitemap reads are public, so keep the route cacheable instead of querying
// the database on every crawler hit.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const projectUrls: MetadataRoute.Sitemap = (projects ?? []).map((p) => ({
    url: `${BASE}/projects/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/viva`, changeFrequency: "weekly", priority: 0.6 },
  ];

  return [...staticRoutes, ...projectUrls];
}
