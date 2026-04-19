"use client";

import { useProjectHouse } from "@/components/providers/ThemeProvider";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/features/Hero";
import { Catalog } from "@/components/features/Catalog";
import { Pricing } from "@/components/features/Pricing";
import { Contact } from "@/components/features/Contact";
import { Drawer } from "@/components/modals/Drawer";
import { SearchPalette } from "@/components/modals/SearchPalette";
import { TweakPanel } from "@/components/modals/TweakPanel";
import { AuthModal } from "@/components/modals/AuthModal";
import { VivaModal } from "@/components/modals/VivaModal";

export default function Home() {
  const { dark } = useProjectHouse();

  return (
    <>
      <Nav />
      <Hero />
      <Catalog />
      <Pricing />
      <Contact />
      <Footer />
      <Drawer />
      <SearchPalette />
      <TweakPanel />
      <AuthModal />
      <VivaModal />
    </>
  );
}
