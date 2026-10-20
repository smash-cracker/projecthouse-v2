import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/utils/supabase/public";
import ProjectDetailClient from "./ProjectDetailClient";

type Props = { params: Promise<{ id: string }> };

// Project pages are public, so they don't need the user's session. Reading
// them with a cookieless client keeps the route cacheable (ISR) instead of
// dynamic, and `cache()` lets generateMetadata and the page share one query.
export const revalidate = 300;

const getProject = cache(async (id: string) => {
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  return data;
});

// Pre-render the current catalog at build time; projects added later are
// generated on demand and then cached like the rest.
export async function generateStaticParams() {
  const supabase = createPublicClient();

  const { data } = await supabase.from("projects").select("id");

  return (data ?? []).map((p) => ({ id: p.id }));
}

// ─── SEO metadata ────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) return {};

  const description = project.description ?? "";
  const keywords = [project.cat, ...(project.stack ?? [])].filter(Boolean);

  return {
    title: project.title,
    description,
    keywords,
    openGraph: {
      title: project.title,
      description,
      url: `https://www.projecthouse.in/projects/${id}`,
      siteName: "Project House",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
    },
    alternates: {
      canonical: `https://www.projecthouse.in/projects/${id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  // The project is publicly visible — no auth required.
  const project = await getProject(id);

  if (!project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: project.title,
    description: project.description ?? "",
    url: `https://www.projecthouse.in/projects/${id}`,
    image: "https://www.projecthouse.in/og.png",
    brand: { "@type": "Brand", name: "Project House" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: project.price,
      availability: "https://schema.org/InStock",
      url: `https://www.projecthouse.in/projects/${id}`,
      seller: { "@type": "Organization", name: "Project House" },
    },
    ...(project.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: project.rating,
        bestRating: 5,
        ratingCount: project.downloads ?? 1,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectDetailClient project={project} />
    </>
  );
}
