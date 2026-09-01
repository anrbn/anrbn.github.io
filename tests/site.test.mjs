import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("builds the CMS-driven archive without a client framework", async () => {
  const html = await readFile(new URL("dist/index.html", root), "utf8");
  assert.match(html, /<title>Margin \/ Notes<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/anirban\.cloud\/"/);
  assert.match(html, />Blogs</);
  assert.match(html, />Thoughts</);
  assert.match(html, /data-list="blog"/);
  assert.match(html, /data-list="thought"/);
  assert.match(html, /class="flower-decoration"/);
  assert.match(html, /src="\/flower\.png"/);
  assert.doesNotMatch(html, /react-dom|__next|vinext/i);
});

test("emits publishing files and keeps the article rail focused", async () => {
  const [rss, robots, cms, articleLayout, tocBranch, articleStyles, siteIdentity] = await Promise.all([
    readFile(new URL("dist/rss.xml", root), "utf8"),
    readFile(new URL("dist/robots.txt", root), "utf8"),
    readFile(new URL(".pages.yml", root), "utf8"),
    readFile(new URL("src/layouts/PostLayout.astro", root), "utf8"),
    readFile(new URL("src/components/TocBranch.astro", root), "utf8"),
    readFile(new URL("src/styles/article.css", root), "utf8"),
    readFile(new URL("src/components/SiteIdentity.astro", root), "utf8"),
  ]);
  assert.match(rss, /<rss/);
  assert.match(robots, /https:\/\/anirban\.cloud\/sitemap-index\.xml/);
  assert.match(cms, /path: src\/content\/posts/);
  assert.match(tocBranch, /data-toc-link/);
  assert.doesNotMatch(articleLayout, /<h2>Archive<\/h2>/);
  assert.doesNotMatch(articleLayout, />On this page</);
  assert.doesNotMatch(articleLayout, /href="#article-title"/);
  assert.match(articleLayout, /<FlowerDecoration \/>/);
  assert.match(articleLayout, /heading\.depth >= 1 && heading\.depth <= 3/);
  assert.match(tocBranch, /<Astro\.self node=\{child\}/);
  assert.match(articleStyles, /\.article-body h1/);
  assert.match(articleStyles, /\.contents \{[^}]*display: flex;[^}]*overflow: hidden;/);
  assert.match(articleStyles, /\.contents > nav \{[^}]*overflow-y: auto;/);
  assert.match(siteIdentity, />anirban\.cloud<\/a>/);
  await access(new URL("dist/flower.png", root));
  await access(new URL("dist/sitemap-index.xml", root));
  await assert.rejects(access(new URL("dist/concepts/01-quiet-folio/index.html", root)));
});
