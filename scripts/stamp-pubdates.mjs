#!/usr/bin/env node

/**
 * Stamps pubDate in article frontmatter based on the date the file was
 * first added to the repo (git log --diff-filter=A).
 *
 * Usage:
 *   node scripts/stamp-pubdates.mjs              # dry-run (show what would change)
 *   node scripts/stamp-pubdates.mjs --apply      # apply changes
 *   node scripts/stamp-pubdates.mjs --files a.mdx b.mdx   # only specific files
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.resolve(__dirname, "..", "src", "content", "articles");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const filesIdx = args.indexOf("--files");
const specificFiles = filesIdx !== -1 ? args.slice(filesIdx + 1) : null;

function getGitAddedDate(filePath) {
  try {
    const result = execSync(
      `git log --follow --diff-filter=A --format=%as -- "${filePath}"`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    ).trim();
    // Take the earliest date (last line) in case of multiple results
    const lines = result.split("\n").filter(Boolean);
    return lines.length > 0 ? lines[lines.length - 1] : null;
  } catch {
    return null;
  }
}

function run() {
  const files = specificFiles
    ? specificFiles.map((f) => path.resolve(f))
    : fs.readdirSync(ARTICLES_DIR)
        .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
        .map((f) => path.join(ARTICLES_DIR, f));

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const filePath of files) {
    const name = path.basename(filePath);
    const content = fs.readFileSync(filePath, "utf8");

    const gitDate = getGitAddedDate(filePath);
    if (!gitDate) {
      console.log(`[SKIP] ${name} — no git history found`);
      skipped++;
      continue;
    }

    const match = content.match(/^pubDate:\s*(.+)$/m);
    if (!match) {
      console.log(`[SKIP] ${name} — no pubDate field in frontmatter`);
      skipped++;
      continue;
    }

    const currentVal = match[1].trim();
    // Normalize to YYYY-MM-DD for comparison
    const currentNorm = currentVal.replace(/T.*$/, "");

    if (currentNorm === gitDate) {
      skipped++;
      continue;
    }

    if (apply) {
      const updated = content.replace(/^pubDate:.*$/m, `pubDate: ${gitDate}`);
      fs.writeFileSync(filePath, updated);
      console.log(`[FIX]  ${name}  ${currentVal} → ${gitDate}`);
    } else {
      console.log(`[WOULD FIX]  ${name}  ${currentVal} → ${gitDate}`);
    }
    fixed++;
  }

  console.log(
    `\n${apply ? "Fixed" : "Would fix"}: ${fixed}, Skipped: ${skipped}${errors ? `, Errors: ${errors}` : ""}`
  );
}

run();
