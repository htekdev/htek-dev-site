#!/usr/bin/env node

/**
 * Syncs MDX articles from src/content/articles/ to Medium.
 *
 * Usage:
 *   MEDIUM_ACCESS_TOKEN=<token> node scripts/sync-medium.mjs [--dry-run]
 *
 * IMPORTANT: Medium's API is CREATE-ONLY — there is no update/edit endpoint.
 * Once an article has a `medium_id` in its frontmatter, it will be skipped
 * on all future syncs. To re-publish, manually remove `medium_id` from the
 * frontmatter (this will create a duplicate on Medium).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { sleep, computeHash, convertBody, writeFrontmatter, readArticles } from "./lib/sync-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.resolve(__dirname, "..", "src", "content", "articles");
const SITE_URL = "https://htek.dev";
const MEDIUM_API = "https://api.medium.com/v1";

const DRY_RUN = process.argv.includes("--dry-run");

// ── Medium API helpers ──────────────────────────────────────────────

async function mediumFetch(endpoint, options = {}) {
  const token = process.env.MEDIUM_ACCESS_TOKEN;
  const url = endpoint.startsWith("http") ? endpoint : `${MEDIUM_API}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return res;
}

async function mediumFetchWithRetry(endpoint, options = {}, retries = 3) {
  let delay = 2000;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await mediumFetch(endpoint, options);

    if (res.status === 429 && attempt < retries) {
      console.warn(`  Rate limited, retrying in ${delay / 1000}s...`);
      await sleep(delay);
      delay = Math.min(delay * 2, 30000);
      continue;
    }

    return res;
  }
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const token = process.env.MEDIUM_ACCESS_TOKEN;
  if (!token && !DRY_RUN) {
    console.error("MEDIUM_ACCESS_TOKEN environment variable is required");
    process.exit(1);
  }

  // Fetch authenticated user ID
  let userId;
  if (!DRY_RUN) {
    console.log("Fetching Medium user info...");
    const meRes = await mediumFetch("/me");
    if (!meRes.ok) {
      if (meRes.status === 401) {
        console.error("Invalid access token");
        process.exit(1);
      }
      console.error(`Failed to fetch user info: ${meRes.status}`);
      process.exit(1);
    }
    const meData = await meRes.json();
    userId = meData.data.id;
    console.log(`User: ${meData.data.name} (id: ${userId})\n`);
  }

  const articles = readArticles(ARTICLES_DIR);

  let created = 0;
  let skipped = 0;

  for (const { file, filePath, slug, frontmatter, content } of articles) {
    const title = frontmatter.title;

    // Skip drafts
    if (frontmatter.draft === true) {
      console.log(`[SKIP] ${title} (draft)`);
      skipped++;
      continue;
    }

    // Skip already published (Medium has no update API)
    if (frontmatter.medium_id) {
      console.log(`[SKIP] ${title} (already published on Medium)`);
      skipped++;
      continue;
    }

    // Dry-run mode
    if (DRY_RUN) {
      console.log(`[SKIP] ${title} (dry-run, would CREATE)`);
      skipped++;
      continue;
    }

    const canonicalUrl = `${SITE_URL}/articles/${slug}/`;
    const bodyMarkdown = convertBody(content, SITE_URL);
    const tags = frontmatter.tags?.slice(0, 5) || [];

    const payload = {
      title,
      contentFormat: "markdown",
      content: bodyMarkdown,
      canonicalUrl,
      tags,
      publishStatus: "public",
    };

    try {
      const res = await mediumFetchWithRetry(`/users/${userId}/posts`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        if (res.status === 401) {
          console.error("Invalid access token");
          process.exit(1);
        }
        console.error(`[ERROR] ${title}: ${res.status} ${err}`);
        continue;
      }

      const result = await res.json();
      const mediumId = result.data.id;
      const mediumUrl = result.data.url;
      writeFrontmatter(filePath, { medium_id: mediumId });
      console.log(`[CREATE] ${title} (id: ${mediumId}, url: ${mediumUrl})`);
      created++;
    } catch (err) {
      console.error(`[ERROR] ${title}: ${err.message}`);
      continue;
    }

    // Medium is stricter on rate limits
    await sleep(1000);
  }

  console.log(`\nSync complete: ${created} created, ${skipped} skipped`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
