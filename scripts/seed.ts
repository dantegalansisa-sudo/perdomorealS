/**
 * Seeds a Supabase project with the sample content from src/data/seed.ts.
 * Everything inserted is flagged is_placeholder = true.
 *
 *   npm run seed            # upsert (safe to re-run)
 *   npm run seed -- --reset # delete existing content rows first (keeps leads & users)
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { seedFaqs, seedModels, seedPosts, seedProjects, seedProperties, seedSettings, seedUnits } from "../src/data/seed";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (.env.local)");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const reset = process.argv.includes("--reset");

async function run(label: string, p: PromiseLike<{ error: { message: string } | null }>) {
  const { error } = await p;
  if (error) {
    console.error(`✗ ${label}: ${error.message}`);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
}

async function main() {
  if (reset) {
    for (const table of ["faqs", "posts", "media", "units", "villa_models", "properties", "projects"]) {
      await run(`reset ${table}`, db.from(table).delete().not("id", "is", null));
    }
  }
  await run("settings", db.from("settings").upsert(seedSettings));
  await run(`projects (${seedProjects.length})`, db.from("projects").upsert(seedProjects.map(({ media: _m, ...p }) => p)));
  await run(`villa models (${seedModels.length})`, db.from("villa_models").upsert(seedModels.map(({ media: _m, ...m }) => m)));
  await run(`units (${seedUnits.length})`, db.from("units").upsert(seedUnits));
  await run(`properties (${seedProperties.length})`, db.from("properties").upsert(seedProperties.map(({ media: _m, ...p }) => p)));
  await run(`posts (${seedPosts.length})`, db.from("posts").upsert(seedPosts));
  await run(`faqs (${seedFaqs.length})`, db.from("faqs").upsert(seedFaqs));
  console.log("\nDone. All rows are marked is_placeholder = true.");
}

main();
