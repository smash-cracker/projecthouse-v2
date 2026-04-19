/**
 * One-time script to grant admin role via app_metadata.
 * Run with: node scripts/make-admin.mjs <user-uuid>
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Manually parse .env.local (no dotenv needed)
const env = {};
try {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) env[key.trim()] = rest.join("=").trim();
  }
} catch {
  console.error("❌  Could not read .env.local");
  process.exit(1);
}

const url = env["NEXT_PUBLIC_SUPABASE_URL"];
const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!url || !serviceKey) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const userId = process.argv[2];

if (!userId) {
  console.error("❌  Usage: node scripts/make-admin.mjs <user-uuid>");
  process.exit(1);
}

const { data, error } = await supabase.auth.admin.updateUserById(userId, {
  app_metadata: { role: "admin" },
});

if (error) {
  console.error("❌  Error:", error.message);
  process.exit(1);
}

console.log("✅  Admin role granted to:", data.user.email);
console.log("    app_metadata:", data.user.app_metadata);
console.log("\n💡  Sign out and back in for the JWT to update.");
