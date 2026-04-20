// Run once: node scripts/seed-bundles.mjs
// Populates bundles table with pricing tiers. Safe to re-run — clears first.

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

const BUNDLES = [
  { 
    id: 'portfolio', 
    title: 'Portfolio Pack', 
    price: 3999, 
    description: 'For a graduating class', 
    features: ['Any 3 projects, any category','Full source + datasets','Reports + slide decks','Deployment walkthrough','30-day live support','Private mentor review call'], 
    cta: 'Get portfolio pack',
    color: '#2A2FB8',
    featured: false
  },
  { 
    id: 'solo', 
    title: 'Solo Project', 
    price: 1499, 
    featured: true, 
    description: 'For a single capstone', 
    features: ['Pick any 1 project','Full source + dataset','Report + slides','Setup guide','7-day Q&A support'], 
    cta: 'Buy single project',
    color: '#FF8A5C'
  },
  { 
    id: 'studio', 
    title: 'Department Licence', 
    price: 14999, 
    description: 'For a cohort or institution', 
    features: ['All 48 projects, all updates','Classroom licence (up to 40 students)','Private help channel','Instructor deck + rubric','90-day priority support','Quarterly new-project drop'], 
    cta: 'Talk to us',
    color: '#0A0F2C',
    featured: false
  },
];

async function seed() {
  console.log("  Clearing existing bundles...");
  // Use a condition that is always true but matches something likely to exist, or just use delete everything
  const { error: delErr } = await supabase.from("bundles").delete().neq("id", "___never___");
  if (delErr) { 
    console.error("Delete failed:", delErr.message); 
    console.log("Note: If the table doesn't exist, please create it in Supabase first.");
    process.exit(1); 
  }

  console.log(`📥  Inserting ${BUNDLES.length} bundles...`);
  const { error: insErr } = await supabase.from("bundles").insert(BUNDLES);
  if (insErr) { 
    console.error("Insert failed:", insErr.message); 
    console.log("\nPossible Fix: You might need to add missing columns to your 'bundles' table:");
    console.log("ALTER TABLE bundles ADD COLUMN IF NOT EXISTS features TEXT[];");
    console.log("ALTER TABLE bundles ADD COLUMN IF NOT EXISTS cta TEXT;");
    console.log("ALTER TABLE bundles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;");
    process.exit(1); 
  }

  console.log(`✅  Done! ${BUNDLES.length} bundles seeded.`);
}

seed();
