import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viva Prep",
  description:
    "Practice common viva questions across Machine Learning, Deep Learning, Computer Vision, Web, and Mobile categories. Includes an AI bot for project-specific prep.",
  openGraph: {
    title: "Viva Prep — Project House",
    description:
      "Practice common viva questions across ML, DL, CV, Web, and Mobile. Includes an AI bot for project-specific prep.",
    url: "https://www.projecthouse.in/viva",
    siteName: "Project House",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viva Prep — Project House",
    description: "Practice common viva questions and use the AI bot for project-specific prep.",
  },
  alternates: {
    canonical: "https://www.projecthouse.in/viva",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function VivaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
