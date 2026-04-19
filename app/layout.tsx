import type { Metadata } from "next";
import { Instrument_Serif, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { cookies } from "next/headers";
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
  title: "Project House — Ready-made capstone projects for students",
  description: "Ready-made capstone projects for students",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("ph-theme")?.value ?? "light";

  return (
    <html
      lang="en"
      data-theme={theme}
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider initialTheme={theme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
