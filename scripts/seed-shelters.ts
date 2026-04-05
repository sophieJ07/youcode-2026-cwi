/**
 * seed-shelters.ts
 *
 * Reads the BC shelter CSV and inserts each shelter into the `shelters` table.
 * Each row gets an access_code in the format: <original_id>-<6-digit random number>
 * e.g. S001-483921
 *
 * Usage:
 *   npx tsx scripts/seed-shelters.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← needs service role (bypasses RLS)
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// ─── Config ───────────────────────────────────────────────────────────────────

const CSV_PATH = path.resolve(
  process.env.HOME ?? "",
  "Downloads",
  "Merged Shelter List (ShelterSafe and BC Housing data).xlsx - Merged Shelter List in BC.csv",
);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomSixDigits(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

function generateAccessCode(shelterId: string, existingCodes: Set<string>): string {
  let code: string;
  do {
    code = `${shelterId}-${randomSixDigits()}`;
  } while (existingCodes.has(code));
  existingCodes.add(code);
  return code;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    // Handle commas inside quoted fields
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] ?? "";
    });
    return row;
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error(
      "❌ Missing env vars. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local",
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Read CSV
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV file not found at: ${CSV_PATH}`);
    process.exit(1);
  }
  const content = fs.readFileSync(CSV_PATH, "utf-8");
  const rows = parseCSV(content);
  console.log(`✓ Read ${rows.length} shelters from CSV`);

  // Build rows to insert
  const existingCodes = new Set<string>();
  const toInsert = rows.map((row) => ({
    name: row["name"] ?? "Unknown Shelter",
    access_code: generateAccessCode(row["shelter_id"], existingCodes),
  }));

  // Insert into Supabase
  console.log("Inserting into Supabase...");
  const { data, error } = await supabase
    .from("shelters")
    .insert(toInsert)
    .select("id, name, access_code");

  if (error) {
    console.error("❌ Insert failed:", error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully inserted ${data.length} shelters:`);
  data.slice(0, 5).forEach((s) => {
    console.log(`   ${s.name} → ${s.access_code}`);
  });
  if (data.length > 5) {
    console.log(`   ... and ${data.length - 5} more`);
  }
}

main();