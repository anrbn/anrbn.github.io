import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("builds the CMS-driven archive without a client framework", async () => {
  const html = await readFile(new URL("dist/index.html", root), "utf8");
  assert.match(html, /<title>Margin \/ Notes<\/title>/);
  assert.match(html, />Blogs</);
  assert.match(html, />Thoughts</);
  assert.match(html, /data-list="blog"/);
  assert.match(html, /data-list="thought"/);
  assert.doesNotMatch(html, /react-dom|__next|vinext/i);
});

test("emits publishing files and keeps the article rail focused", async () => {
  const [rss, robots, cms, articleLayout] = await Promise.all([
    readFile(new URL("dist/rss.xml", root), "utf8"),
    readFile(new URL("dist/robots.txt", root), "utf8"),
    readFile(new URL(".pages.yml", root), "utf8"),
    readFile(new URL("src/layouts/PostLayout.astro", root), "utf8"),
  ]);
  assert.match(rss, /<rss/);
  assert.match(robots, /sitemap-index\.xml/);
  assert.match(cms, /path: src\/content\/posts/);
  assert.match(articleLayout, /data-toc-link/);
  assert.doesNotMatch(articleLayout, /<h2>Archive<\/h2>/);
  await access(new URL("dist/sitemap-index.xml", root));
  await assert.rejects(access(new URL("dist/concepts/01-quiet-folio/index.html", root)));
});
