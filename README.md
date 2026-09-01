# Margin / Notes

A static personal blog built with Astro and published by GitHub Pages.

## Publishing

The easiest editor is [Pages CMS](https://app.pagescms.org/). Sign in with
GitHub, open `anrbn/anrbn.github.io`, choose **Posts**, and create an entry.
Saving commits a Markdown file and triggers a GitHub Pages deployment.

You can also create Markdown files directly in `src/content/posts/`. Required
frontmatter:

```yaml
---
title: My post
description: A short summary.
pubDate: 2026-09-01
kind: blog
tags: []
draft: false
---
```

Use fenced code blocks for syntax highlighting. Use `$...$` for inline math and
`$$...$$` for display equations.

## Local development

Requires Node.js 24 or newer.

```sh
npm install
npm run dev
```

Run `npm test` before publishing substantial changes.
