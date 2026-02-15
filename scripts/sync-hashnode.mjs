#!/usr/bin/env node

/**
 * Syncs MDX articles from src/content/articles/ to Hashnode via GraphQL API.
 *
 * Usage:
 *   HASHNODE_API_KEY=<key> HASHNODE_PUBLICATION_ID=<id> node scripts/sync-hashnode.mjs [--dry-run]
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { sleep, computeHash, convertBody, writeFrontmatter, readArticles } from "./lib/sync-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.resolve(__dirname, "..", "src", "content", "articles");
const SITE_URL = "https://htek.dev";
const HASHNODE_API = "https://gql.hashnode.com";

const TAG_MAP = {
  "ai": "artificial-intelligence",
  "github copilot": "github-copilot",
  "open source": "open-source",
  "developer experience": "developer-experience",
  "devops": "devops",
  "software architecture": "software-architecture",
  "multi-agent systems": "ai",
  "automation": "automation",
  "productivity": "productivity",
  "microsoft": "microsoft",
  "azure": "azure",
  "engineering leadership": "leadership",
  "career": "career",
  "cli": "cli",
};

const DRY_RUN = process.argv.includes("--dry-run");

// ── Helpers ──────────────────────────────────────────────────────────

function mapTags(tags) {
  if (!Array.isArray(tags)) return [];
  const mapped = tags.map((t) => {
    const key = t.toLowerCase();
    return TAG_MAP[key] ?? key.replace(/\s+/g, "-");
  });
  return [...new Set(mapped)].slice(0, 5);
}

// ── GraphQL helpers ─────────────────────────────────────────────────

async function hashnodeFetch(query, variables) {
  const res = await fetch(HASHNODE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.HASHNODE_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

async function hashnodeFetchWithRetry(query, variables, retries = 3) {
  let delay = 2000;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(HASHNODE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.HASHNODE_API_KEY,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (res.status === 429 && attempt < retries) {
      console.warn(`  Rate limited, retrying in ${delay / 1000}s...`);
      await sleep(delay);
      delay = Math.min(delay * 2, 30000);
      continue;
    }

    return res.json();
  }
}

// ── GraphQL mutations ───────────────────────────────────────────────

const PUBLISH_POST = `
mutation PublishPost($input: PublishPostInput!) {
  publishPost(input: $input) {
    post {
      id
      title
      slug
      url
    }
  }
}`;

const UPDATE_POST = `
mutation UpdatePost($input: UpdatePostInput!) {
  updatePost(input: $input) {
    post {
      id
      title
      slug
      url
    }
  }
}`;

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.HASHNODE_API_KEY;
  const publicationId = process.env.HASHNODE_PUBLICATION_ID;

  if (!apiKey && !DRY_RUN) {
    console.error("HASHNODE_API_KEY environment variable is required");
    process.exit(1);
  }
  if (!publicationId && !DRY_RUN) {
    console.error("HASHNODE_PUBLICATION_ID environment variable is required");
    process.exit(1);
  }

  console.log("Syncing articles to Hashnode...");

  const articles = readArticles(ARTICLES_DIR);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const { file, filePath, slug, frontmatter, content } of articles) {
    const title = frontmatter.title;

    // Skip drafts
    if (frontmatter.draft === true) {
      console.log(`[SKIP] ${title} (draft)`);
      skipped++;
      continue;
    }

    const canonicalUrl = `${SITE_URL}/articles/${slug}/`;
    const bodyMarkdown = convertBody(content, SITE_URL);
    const tags = mapTags(frontmatter.tags);

    const contentHash = computeHash({ title, bodyMarkdown, tags, canonicalUrl });
    const hashnodeId = frontmatter.hashnode_id;

    // Skip if unchanged
    if (hashnodeId && frontmatter.hashnode_hash === contentHash) {
      console.log(`[SKIP] ${title} (unchanged)`);
      skipped++;
      continue;
    }

    // Dry-run mode
    if (DRY_RUN) {
      const action = hashnodeId ? "UPDATE" : "CREATE";
      console.log(`[SKIP] ${title} (dry-run, would ${action})`);
      skipped++;
      continue;
    }

    try {
      if (hashnodeId) {
        // Update existing post
        const res = await hashnodeFetchWithRetry(UPDATE_POST, {
          input: {
            id: hashnodeId,
            title,
            contentMarkdown: bodyMarkdown,
            tags: tags.map((t) => ({ slug: t, name: t })),
            originalArticleURL: canonicalUrl,
          },
        });

        if (res.errors) {
          const msg = res.errors.map((e) => e.message).join("; ");
          if (msg.toLowerCase().includes("unauthenticated")) {
            console.error("Invalid API key");
            process.exit(1);
          }
          console.error(`[ERROR] ${title}: ${msg}`);
          continue;
        }

        console.log(`[UPDATE] ${title}`);
        writeFrontmatter(filePath, { hashnode_id: hashnodeId, hashnode_hash: contentHash });
        updated++;
      } else {
        // Create new post
        const res = await hashnodeFetchWithRetry(PUBLISH_POST, {
          input: {
            publicationId,
            title,
            contentMarkdown: bodyMarkdown,
            tags: tags.map((t) => ({ slug: t, name: t })),
            originalArticleURL: canonicalUrl,
          },
        });

        if (res.errors) {
          const msg = res.errors.map((e) => e.message).join("; ");
          if (msg.toLowerCase().includes("unauthenticated")) {
            console.error("Invalid API key");
            process.exit(1);
          }
          console.error(`[ERROR] ${title}: ${msg}`);
          continue;
        }

        const postId = res.data.publishPost.post.id;
        writeFrontmatter(filePath, { hashnode_id: postId, hashnode_hash: contentHash });
        console.log(`[CREATE] ${title} (id: ${postId})`);
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
