// Update pricing tiers in the bundles table.
// Run after changing plan prices/features: node scripts/seed-bundles.mjs
// Upserts by id, so bundles added through the admin UI are left alone.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Manually parse .env.local
const env = {};
try {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) env[key.trim()] = rest.join("=").trim();
  }
} catch {
  console.error(" Could not read .env.local");
  process.exit(1);
}

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_KEY  = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(" Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function seed() {
  // Keep the "All N projects" line in sync with the catalog.
  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true });
  const totalProjects = count ?? 48;

  const BUNDLES = [
    {
      id: 'portfolio',
      title: 'Portfolio Pack',
      price: 8999,
      description: 'For a graduating class',
      features: ['Any 3 projects, any category','Full source + datasets','Reports + slide decks','Deployment walkthrough','30-day live support','Private mentor review call'],
      cta: 'Get portfolio pack',
      color: '#2A2FB8',
      featured: false
    },
    {
      id: 'solo',
      title: 'Solo Project',
      price: 5999,
      featured: true,
      description: 'For a single capstone',
      features: ['Pick any 1 project','Full source + dataset','Report + slides','Setup guide','7-day Q&A support'],
      cta: 'Buy single project',
      color: '#FF8A5C'
    },
    {
      id: 'team',
      title: 'Team Licence',
      price: 29999,
      description: 'For a team of up to 5',
      features: [`All ${totalProjects} projects, all updates`,'Team licence (up to 5 people)','Private help channel','Shared reports + slide decks','90-day priority support','Quarterly new-project drop'],
      cta: 'Get team licence',
      color: '#0A0F2C',
      featured: false
    },
  ];

  console.log(`📥  Upserting ${BUNDLES.length} pricing tiers...`);
  const { error: upErr } = await supabase
    .from("bundles")
    .upsert(BUNDLES, { onConflict: "id" });

  if (upErr) {
    console.error("Upsert failed:", upErr.message);
    console.log("\nPossible Fix: You might need to add missing columns to your 'bundles' table:");
    console.log("ALTER TABLE bundles ADD COLUMN IF NOT EXISTS features TEXT[];");
    console.log("ALTER TABLE bundles ADD COLUMN IF NOT EXISTS cta TEXT;");
    console.log("ALTER TABLE bundles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;");
    process.exit(1);
  }

  // The old institution tier was replaced by the 5-person Team Licence.
  const { error: delErr } = await supabase.from("bundles").delete().eq("id", "studio");
  if (delErr) {
    console.warn("Could not remove the retired 'studio' tier:", delErr.message);
  }

  console.log(`✅  Done! ${BUNDLES.length} pricing tiers updated.`);
}

seed();
