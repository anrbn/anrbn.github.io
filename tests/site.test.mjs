import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("builds the archive without React", async () => {
  const html = await readFile(new URL("dist/index.html", root), "utf8");
  assert.match(html, /<title>Margin \/ Notes<\/title>/);
  assert.match(html, /The shape of a good note\./);
  assert.match(html, /A small HTTP client, built in layers\./);
  assert.match(html, />Blogs</);
  assert.match(html, />Thoughts</);
  assert.doesNotMatch(html, /react-dom|__next|vinext/i);
});

test("preserves the proof-of-concept article URLs", async () => {
  await Promise.all([
    access(new URL("dist/concepts/01-quiet-folio/index.html", root)),
    access(new URL("dist/concepts/01-quiet-folio/coding-in-layers.html", root)),
  ]);
});

test("emits publishing and discovery files", async () => {
  const [rss, robots, cms] = await Promise.all([
    readFile(new URL("dist/rss.xml", root), "utf8"),
    readFile(new URL("dist/robots.txt", root), "utf8"),
    readFile(new URL(".pages.yml", root), "utf8"),
  ]);
  assert.match(rss, /<rss/);
  assert.match(robots, /sitemap-index\.xml/);
  assert.match(cms, /path: src\/content\/posts/);
  await access(new URL("dist/sitemap-index.xml", root));
  await assert.rejects(access(new URL("dist/posts/new-post-template/index.html", root)));
});
