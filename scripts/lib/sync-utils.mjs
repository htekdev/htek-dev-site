import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function computeHash(payload) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
}

export function convertBody(body, siteUrl) {
  let out = body;

  // Strip MDX import lines
  out = out.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, "");
  out = out.replace(/^import\s+['"].*?['"];?\s*$/gm, "");

  // Strip JSX self-closing component tags (non-HTML)
  out = out.replace(/<([A-Z][A-Za-z0-9.]*)\b[^>]*\/>/g, "");

  // Strip JSX opening + closing pairs of non-HTML tags (single-line and multiline)
  out = out.replace(/<([A-Z][A-Za-z0-9.]*)\b[^>]*>[\s\S]*?<\/\1>/g, "");

  // Convert relative article links: ](/articles/slug) → ](siteUrl/articles/slug/)
  out = out.replace(
    /\]\(\/articles\/([^)]+)\)/g,
    (_, slug) => {
      const cleanSlug = slug.endsWith("/") ? slug : slug + "/";
      return `](${siteUrl}/articles/${cleanSlug})`;
    }
  );

  // Convert relative image src="/..." to absolute
  out = out.replace(/src="\/(?!\/)/g, `src="${siteUrl}/`);

  // Convert remaining relative markdown image/link paths
  out = out.replace(
    /\]\(\/(?!articles\/|\/)/g,
    `](${siteUrl}/`
  );

  // Clean up blank lines left by stripped imports/components
  out = out.replace(/\n{3,}/g, "\n\n");

  return out.trim();
}

export function writeFrontmatter(filePath, fields) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw);
  Object.assign(parsed.data, fields);
  const updated = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(filePath, updated, "utf-8");
}

export function readArticles(articlesDir) {
  const files = fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".mdx"))
    .sort();

  return files.map((file) => {
    const filePath = path.join(articlesDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(raw);
    const slug = file.replace(/\.mdx$/, "");
    return { file, filePath, slug, frontmatter, content };
  });
}
