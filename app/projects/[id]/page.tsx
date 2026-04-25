import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProjectDetailClient from "./ProjectDetailClient";

type Props = { params: Promise<{ id: string }> };

// ─── SEO metadata ────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("title, description, cat, stack")
    .eq("id", id)
    .single();

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
  const supabase = await createClient();

  // The project is publicly visible — no auth required.
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  // Check if the current user has purchased this project (optional).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let payment: {
    id: string;
    created_at: string;
    amount: number;
    razorpay_payment_id: string;
  } | null = null;

  if (user) {
    const { data } = await supabase
      .from("payments")
      .select("id, created_at, amount, razorpay_payment_id")
      .eq("project_id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    payment = data ?? null;
  }

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
      <ProjectDetailClient project={project} payment={payment} />
    </>
  );
}
