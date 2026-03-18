import { describe, it, expect } from "vitest";
import { convertBody, resolveImageUrl, RAW_IMAGE_BASE_URL } from "../sync-utils.mjs";

const SITE_URL = "https://htek.dev";

describe("RAW_IMAGE_BASE_URL", () => {
  it("points to the raw GitHub public directory", () => {
    expect(RAW_IMAGE_BASE_URL).toBe(
      "https://raw.githubusercontent.com/htekdev/htek-dev-site/main/public"
    );
  });
});

describe("resolveImageUrl", () => {
  it("prepends imageBaseUrl to relative paths", () => {
    expect(resolveImageUrl("/articles/hero.png", RAW_IMAGE_BASE_URL)).toBe(
      "https://raw.githubusercontent.com/htekdev/htek-dev-site/main/public/articles/hero.png"
    );
  });

  it("returns absolute URLs unchanged", () => {
    const absUrl = "https://example.com/image.png";
    expect(resolveImageUrl(absUrl, RAW_IMAGE_BASE_URL)).toBe(absUrl);
  });

  it("returns undefined for falsy input", () => {
    expect(resolveImageUrl(undefined, RAW_IMAGE_BASE_URL)).toBeUndefined();
    expect(resolveImageUrl("", RAW_IMAGE_BASE_URL)).toBeUndefined();
  });
});

describe("convertBody", () => {
  describe("markdown images", () => {
    it("converts relative image paths to imageBaseUrl", () => {
      const body = "![Screenshot](/articles/my-image.png)";
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).toBe(
        `![Screenshot](${RAW_IMAGE_BASE_URL}/articles/my-image.png)`
      );
    });

    it("converts multiple images", () => {
      const body = [
        "![First](/articles/one.png)",
        "Some text",
        "![Second](/articles/two.jpg)",
      ].join("\n");
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).toContain(`![First](${RAW_IMAGE_BASE_URL}/articles/one.png)`);
      expect(result).toContain(`![Second](${RAW_IMAGE_BASE_URL}/articles/two.jpg)`);
    });

    it("does not touch already-absolute image URLs", () => {
      const body = "![Logo](https://example.com/logo.png)";
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).toBe("![Logo](https://example.com/logo.png)");
    });

    it("does not add trailing slash to image file paths", () => {
      const body = "![Alt](/articles/github-agentic-workflows-issue-triage.png)";
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).not.toContain(".png/");
      expect(result).toBe(
        `![Alt](${RAW_IMAGE_BASE_URL}/articles/github-agentic-workflows-issue-triage.png)`
      );
    });
  });

  describe("HTML img tags", () => {
    it("converts HTML src attributes to imageBaseUrl", () => {
      const body = '<img src="/articles/diagram.png" alt="diagram" />';
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).toBe(
        `<img src="${RAW_IMAGE_BASE_URL}/articles/diagram.png" alt="diagram" />`
      );
    });

    it("does not touch protocol-relative src", () => {
      const body = '<img src="//cdn.example.com/img.png" />';
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).toBe('<img src="//cdn.example.com/img.png" />');
    });
  });

  describe("article links", () => {
    it("converts article links to siteUrl with trailing slash", () => {
      const body = "Read [my guide](/articles/copilot-guide)";
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).toBe(
        "Read [my guide](https://htek.dev/articles/copilot-guide/)"
      );
    });

    it("preserves existing trailing slash on article links", () => {
      const body = "[link](/articles/some-post/)";
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).toBe("[link](https://htek.dev/articles/some-post/)");
    });
  });

  describe("other relative links", () => {
    it("converts non-article relative links to siteUrl", () => {
      const body = "[About](/about)";
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).toBe("[About](https://htek.dev/about)");
    });
  });

  describe("mixed content", () => {
    it("handles images and article links in the same body", () => {
      const body = [
        "![Hero](/articles/hero.png)",
        "",
        "Check out [this article](/articles/my-post) for more.",
        "",
        "![Another](/images/photo.jpg)",
      ].join("\n");
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);

      expect(result).toContain(`![Hero](${RAW_IMAGE_BASE_URL}/articles/hero.png)`);
      expect(result).toContain("[this article](https://htek.dev/articles/my-post/)");
      expect(result).toContain(`![Another](${RAW_IMAGE_BASE_URL}/images/photo.jpg)`);
      expect(result).not.toContain("hero.png/");
    });
  });

  describe("MDX stripping", () => {
    it("strips MDX imports", () => {
      const body = [
        'import MyComponent from "../components/MyComponent.astro";',
        "",
        "# Hello",
      ].join("\n");
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).not.toContain("import");
      expect(result).toContain("# Hello");
    });

    it("strips JSX self-closing tags", () => {
      const body = "Text before\n<MyWidget foo='bar' />\nText after";
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).not.toContain("MyWidget");
      expect(result).toContain("Text before");
      expect(result).toContain("Text after");
    });

    it("strips JSX component pairs", () => {
      const body = "Before\n<CallToAction>Sign up now!</CallToAction>\nAfter";
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).not.toContain("CallToAction");
      expect(result).toContain("Before");
      expect(result).toContain("After");
    });
  });

  describe("backward compatibility", () => {
    it("falls back to siteUrl when imageBaseUrl is not provided", () => {
      const body = "![Alt](/articles/image.png)";
      const result = convertBody(body, SITE_URL);
      expect(result).toBe("![Alt](https://htek.dev/articles/image.png)");
    });

    it("converts HTML src to siteUrl when imageBaseUrl is not provided", () => {
      const body = '<img src="/photo.jpg" />';
      const result = convertBody(body, SITE_URL);
      expect(result).toBe('<img src="https://htek.dev/photo.jpg" />');
    });
  });

  describe("blank line cleanup", () => {
    it("collapses 3+ blank lines to 2", () => {
      const body = "A\n\n\n\nB";
      const result = convertBody(body, SITE_URL, RAW_IMAGE_BASE_URL);
      expect(result).toBe("A\n\nB");
    });
  });
});
