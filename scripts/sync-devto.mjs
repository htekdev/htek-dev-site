#!/usr/bin/env node

/**
 * Syncs MDX articles from src/content/articles/ to DEV.to.
 *
 * Usage:
 *   DEVTO_API_KEY=<key> node scripts/sync-devto.mjs [--dry-run]
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.resolve(__dirname, "..", "src", "content", "articles");
const SITE_URL = "https://htek.dev";
const DEVTO_API = "https://dev.to/api";

const TAG_MAP = {
  "ai": "ai",
  "github copilot": "github",
  "open source": "opensource",
  "developer experience": "devex",
  "devops": "devops",
  "software architecture": "architecture",
  "multi-agent systems": "ai",
  "automation": "automation",
  "productivity": "productivity",
  "microsoft": "microsoft",
  "azure": "azure",
  "engineering leadership": "leadership",
  "career": "career",
  "video editing": "video",
  "devchallenge": "devchallenge",
  "githubchallenge": "githubchallenge",
  "cli": "cli",
  "githubcopilot": "githubcopilot",
};

const DRY_RUN = process.argv.includes("--dry-run");

// ── Helpers ──────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeHash(payload) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
}

function mapTags(tags) {
  if (!Array.isArray(tags)) return [];
  const mapped = tags.map((t) => {
    const key = t.toLowerCase();
    return TAG_MAP[key] ?? key.replace(/\s+/g, "");
  });
  return [...new Set(mapped)].slice(0, 4);
}

function convertBody(body) {
  let out = body;

  // Strip MDX import lines
  out = out.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, "");
  out = out.replace(/^import\s+['"].*?['"];?\s*$/gm, "");

  // Strip JSX self-closing component tags (non-HTML)
  // Match <ComponentName ... /> but not standard HTML tags
  out = out.replace(/<([A-Z][A-Za-z0-9.]*)\b[^>]*\/>/g, "");

  // Strip JSX opening + closing pairs of non-HTML tags (single-line and multiline)
  out = out.replace(/<([A-Z][A-Za-z0-9.]*)\b[^>]*>[\s\S]*?<\/\1>/g, "");

  // Convert relative article links: ](/articles/slug) → ](https://htek.dev/articles/slug/)
  out = out.replace(
    /\]\(\/articles\/([^)]+)\)/g,
    (_, slug) => {
      const cleanSlug = slug.endsWith("/") ? slug : slug + "/";
      return `](${SITE_URL}/articles/${cleanSlug})`;
    }
  );

  // Convert relative image src="/..." to absolute
  out = out.replace(/src="\/(?!\/)/g, `src="${SITE_URL}/`);

  // Convert remaining relative markdown image/link paths ](/ → ](https://htek.dev/
  // But not already-absolute URLs and not the article links we already handled
  out = out.replace(
    /\]\(\/(?!articles\/|\/)/g,
    `](${SITE_URL}/`
  );

  // Clean up blank lines left by stripped imports/components
  out = out.replace(/\n{3,}/g, "\n\n");

  return out.trim();
}

// ── DEV.to API helpers ──────────────────────────────────────────────

async function devtoFetch(endpoint, options = {}) {
  const apiKey = process.env.DEVTO_API_KEY;
  const url = endpoint.startsWith("http") ? endpoint : `${DEVTO_API}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
      ...options.headers,
    },
  });
  return res;
}

async function devtoFetchWithRetry(endpoint, options = {}, retries = 3) {
  let delay = 2000;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await devtoFetch(endpoint, options);

    if (res.status === 429 && attempt < retries) {
      console.warn(`  Rate limited, retrying in ${delay / 1000}s...`);
      await sleep(delay);
      delay = Math.min(delay * 2, 30000);
      continue;
    }

    return res;
  }
}

async function fetchAllPublished() {
  const articles = [];
  let page = 1;
  while (true) {
    const res = await devtoFetch(`/articles/me/published?per_page=100&page=${page}`);
    if (!res.ok) {
      if (res.status === 401) {
        console.error("Invalid API key");
        process.exit(1);
      }
      console.error(`Failed to fetch published articles: ${res.status}`);
      break;
    }
    const data = await res.json();
    if (data.length === 0) break;
    articles.push(...data);
    if (data.length < 100) break;
    page++;
  }
  return articles;
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey && !DRY_RUN) {
    console.error("DEVTO_API_KEY environment variable is required");
    process.exit(1);
  }

  // Build canonical URL → DEV.to ID map from existing articles
  const canonicalMap = new Map();
  if (!DRY_RUN) {
    console.log("Fetching existing DEV.to articles...");
    const published = await fetchAllPublished();
    for (const a of published) {
      if (a.canonical_url) {
        canonicalMap.set(a.canonical_url, a.id);
      }
    }
    console.log(`Found ${canonicalMap.size} existing articles on DEV.to\n`);
  }

  // Read all MDX files
  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .sort();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(raw);

    const title = frontmatter.title;
    const slug = file.replace(/\.mdx$/, "");

    // Skip drafts
    if (frontmatter.draft === true) {
      console.log(`[SKIP] ${title} (draft)`);
      skipped++;
      continue;
    }

    // Dry-run mode
    if (DRY_RUN) {
      const action = frontmatter.devto_id ? "UPDATE" : "CREATE";
      console.log(`[SKIP] ${title} (dry-run, would ${action})`);
      skipped++;
      continue;
    }

    const canonicalUrl = `${SITE_URL}/articles/${slug}/`;
    const bodyMarkdown = convertBody(content);
    const tags = mapTags(frontmatter.tags);

    const payload = {
      article: {
        title,
        body_markdown: bodyMarkdown,
        published: true,
        tags,
        canonical_url: canonicalUrl,
        description: frontmatter.description || "",
      },
    };

    // Determine devto_id: from frontmatter, or from canonical URL match
    let devtoId = frontmatter.devto_id;
    if (!devtoId && canonicalMap.has(canonicalUrl)) {
      devtoId = canonicalMap.get(canonicalUrl);
      // Write the discovered ID back to frontmatter
      writeFrontmatter(filePath, { devto_id: devtoId });
      console.log(`  Matched existing DEV.to article (id: ${devtoId})`);
    }

    // Skip if content hasn't changed since last sync
    const contentHash = computeHash(payload);
    if (devtoId && frontmatter.devto_hash === contentHash) {
      console.log(`[SKIP] ${title} (unchanged)`);
      skipped++;
      continue;
    }

    try {
      if (devtoId) {
        // Update existing article
        const res = await devtoFetchWithRetry(`/articles/${devtoId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.text();
          if (res.status === 401) {
            console.error("Invalid API key");
            process.exit(1);
          }
          if (res.status === 422) {
            console.error(`[ERROR] ${title}: ${err}`);
            continue;
          }
          console.error(`[ERROR] ${title}: ${res.status} ${err}`);
          continue;
        }

        console.log(`[UPDATE] ${title}`);
        writeFrontmatter(filePath, { devto_id: devtoId, devto_hash: contentHash });
        updated++;
      } else {
        // Create new article
        const res = await devtoFetchWithRetry(`/articles`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.text();
          if (res.status === 401) {
            console.error("Invalid API key");
            process.exit(1);
          }
          if (res.status === 422) {
            console.error(`[ERROR] ${title}: ${err}`);
            continue;
          }
          console.error(`[ERROR] ${title}: ${res.status} ${err}`);
          continue;
        }

        const result = await res.json();
        writeFrontmatter(filePath, { devto_id: result.id, devto_hash: contentHash });
        console.log(`[CREATE] ${title} (id: ${result.id})`);
        created++;
      }
    } catch (err) {
      console.error(`[ERROR] ${title}: ${err.message}`);
      continue;
    }

    // Small delay between API calls
    await sleep(500);
  }

  console.log(`\nSync complete: ${created} created, ${updated} updated, ${skipped} skipped`);
}

function writeFrontmatter(filePath, fields) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw);
  Object.assign(parsed.data, fields);
  const updated = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(filePath, updated, "utf-8");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
