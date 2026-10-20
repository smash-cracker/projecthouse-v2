import type { Metadata } from "next";
import { Instrument_Serif, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.projecthouse.in"),
  title: {
    default: "Project House — Ready-made capstone projects for students",
    template: "%s — Project House",
  },
  description:
    "Browse ready-made final-year capstone projects in ML, Deep Learning, Computer Vision, Web & Mobile. Full source code, datasets, and viva prep included.",
  keywords: [
    "capstone projects",
    "final year projects",
    "machine learning projects",
    "deep learning projects",
    "computer vision projects",
    "student projects India",
  ],
  openGraph: {
    title: "Project House — Ready-made capstone projects for students",
    description:
      "Browse ready-made final-year capstone projects in ML, Deep Learning, Computer Vision, Web & Mobile. Full source code, datasets, and viva prep included.",
    url: "https://www.projecthouse.in",
    siteName: "Project House",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project House — Ready-made capstone projects for students",
    description:
      "Browse ready-made final-year capstone projects in ML, Deep Learning, Computer Vision, Web & Mobile.",
  },
  alternates: {
    canonical: "https://www.projecthouse.in",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Applied before first paint so dark-mode visitors don't see a light flash.
// Reading this cookie in the layout would opt every route into dynamic rendering.
const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)ph-theme=([^;]+)/);if(m&&decodeURIComponent(m[1])==="dark"){document.documentElement.setAttribute("data-theme","dark")}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
