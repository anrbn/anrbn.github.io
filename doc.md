# Margin / Notes: maintainer and agent guide

This document is the technical source of truth for the blog at
[https://anrbn.github.io/](https://anrbn.github.io/). Read it before changing
the publishing setup, content schema, routes, or deployment workflow.

Last verified: 2026-09-01.

## Read this first

- The live site is a static Astro site hosted by **GitHub Pages**.
- The source of truth is the public GitHub repository
  [`anrbn/anrbn.github.io`](https://github.com/anrbn/anrbn.github.io), branch
  `main`.
- [Pages CMS](https://app.pagescms.org/) is a browser editor for repository
  files. It is not a database, runtime dependency, build system, or host.
- Saving in Pages CMS creates an ordinary Git commit on GitHub. A push to
  `main` starts the GitHub Actions deployment.
- There is no React, Next.js, application server, API, database, authentication
  layer, Cloudflare Worker, or active ChatGPT Sites deployment in this version.
- The old `*.chatgpt.site` preview is not production. Do not restore the retired
  Sites/Next/vinext stack unless the owner explicitly asks for a migration.
- Pages CMS can commit while another agent is working. Always synchronize with
  remote `main`, preserve the CMS commit, and never force-push.

## System overview

```text
Pages CMS editor                          Direct Git/Markdown edit
        |                                          |
        +---------- commits files to --------------+
                               |
                     GitHub repository: main
                               |
                   push triggers GitHub Actions
                               |
                 Astro validates and builds dist/
                               |
                GitHub Pages deploys the artifact
                               |
                    https://anrbn.github.io/
```

The deployed site contains generated HTML, CSS, a few small browser scripts,
fonts loaded from Google Fonts, and a GitHub icon loaded from jsDelivr. Visitors
do not contact Pages CMS or an application backend.

## Production facts

| Item | Current value |
| --- | --- |
| Repository | `anrbn/anrbn.github.io` |
| Production branch | `main` |
| Live URL | `https://anrbn.github.io/` |
| Host | GitHub Pages |
| Build/deploy system | GitHub Actions |
| Static-site generator | Astro 7 |
| Required Node version | 24 or newer |
| Package manager | npm (`package-lock.json` is committed) |
| Custom domain | None configured |
| CMS | Pages CMS, editing GitHub files |
| Content database | None |

This local checkout has historically used a remote named `github` and a local
branch named `astro-migration` that tracks `github/main`. A fresh clone may use
`origin` instead. Never assume a remote or branch name; inspect them:

```sh
git status --short --branch
git branch -vv
git remote -v
```

The local branch named `main` may be stale in an existing workspace. Production
is the current remote `main`, not whatever a local branch happens to contain.

## Repository map

```text
.
├── .github/workflows/deploy.yml    # GitHub Pages build and deployment
├── .pages.yml                      # Pages CMS editor/media schema
├── astro.config.mjs                # Site URL, static output, sitemap, math/code
├── package.json                    # Node version, scripts, dependencies
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/posts/               # CMS uploads appear here when present
├── src/
│   ├── components/
│   │   └── SiteIdentity.astro      # Site name and social link
│   ├── content/
│   │   └── posts/                  # Markdown/MDX posts
│   ├── content.config.ts           # Astro content schema
│   ├── layouts/
│   │   ├── BaseLayout.astro        # Global head, fonts, SEO/social metadata
│   │   └── PostLayout.astro        # Article shell, TOC, drawer, copy buttons
│   ├── pages/
│   │   ├── index.astro             # Blog/Thought archive homepage
│   │   ├── 404.astro               # Not-found page
│   │   ├── posts/[slug].astro      # Generated article routes
│   │   └── rss.xml.js              # RSS endpoint
│   └── styles/
│       ├── global.css              # Tokens, identity, homepage
│       └── article.css             # Article, TOC, code, responsive/print styles
├── tests/site.test.mjs             # Build-output smoke tests
├── README.md                       # Short publishing quick start
└── doc.md                          # This full technical handoff
```

`dist/`, `.astro/`, and `node_modules/` are generated/ignored. Use
`git ls-files` to identify the actual deployed source. Old ignored directories
from previous prototypes are not part of production.

## Routes and generated files

| Public route/file | Source | Notes |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Lists non-draft posts, newest first, grouped into Blogs and Thoughts |
| `/posts/<slug>/` | `src/pages/posts/[slug].astro` | One statically generated route per non-draft post |
| `/rss.xml` | `src/pages/rss.xml.js` | Non-draft title, description, date, and link; no full body |
| `/404.html` | `src/pages/404.astro` | GitHub Pages not-found page |
| `/robots.txt` | `public/robots.txt` | Copied directly |
| `/sitemap-index.xml` | Astro sitemap integration | Points to generated sitemap files |
| `/favicon.svg` | `public/favicon.svg` | Copied directly |

The RSS link was removed from the visible article sidebar, but the `/rss.xml`
endpoint still exists and is linked in page metadata.

## Content model

Posts live directly inside `src/content/posts/` as `.md` or `.mdx` files. The
Astro collection loader and validation schema are in `src/content.config.ts`.

Example:

```md
---
title: My post
description: A short summary used on metadata and RSS.
pubDate: 2026-09-01
updatedDate: 2026-09-02
kind: blog
tags:
  - notes
draft: false
image: /images/posts/my-cover.webp
---

Start the article here.
```

| Frontmatter field | Required by Astro | Meaning |
| --- | --- | --- |
| `title` | Yes | Article title and generated `<h1>` |
| `description` | Yes | Subtitle, description metadata, and RSS summary |
| `pubDate` | Yes | Display date and homepage/RSS sort key |
| `updatedDate` | No | Optional updated date displayed in the article header |
| `kind` | Yes | Exactly `blog` or `thought`; controls homepage tab |
| `tags` | No | String list; searchable in CMS, currently not rendered |
| `draft` | No in Astro | Controls publication; Astro defaults a missing value to `false` |
| `image` | No | Social/Open Graph image URL; not a visible article hero |

Important publication rules:

- `draft: false` publishes the post after the next successful deployment.
- `draft: true` removes it from the homepage, article routes, and RSS.
- A future `pubDate` does **not** schedule a post. If `draft` is false, it is
  published immediately.
- Draft Markdown remains readable in the public GitHub repository. Drafts are
  not suitable for secret material.
- A manually written post that omits `draft` is published because Astro's
  schema defaults it to false. Pages CMS is safer: it defaults new entries to
  `draft: true`.
- Keep posts flat inside `src/content/posts/`. The current `[slug]` route is not
  designed for nested post directories.

### Filenames, slugs, and URLs

The Markdown filename, not the title, determines the URL:

```text
src/content/posts/2026-09-01-my-post.md
→ https://anrbn.github.io/posts/2026-09-01-my-post/
```

Changing a post title does not change its URL. Renaming the Markdown file does
change the URL, and there is currently no redirect system, so avoid renaming a
published post without adding a redirect strategy.

Pages CMS creates new filenames using:

```yaml
{year}-{month}-{day}-{primary}.md
```

`primary` is the title and is slugified. The date tokens are the entry creation
date, not the `pubDate` field. The filename can be adjusted during creation but
is not offered as a normal field during later edits.

## Markdown, equations, and code

Astro processes post Markdown during the build:

```text
Markdown
  ├── remark-math identifies $...$ and $$...$$
  ├── rehype-katex renders equations into static KaTeX markup
  └── Shiki highlights fenced code with the github-light theme
```

KaTeX CSS is imported globally in `src/layouts/BaseLayout.astro`. The result is
static page markup; math does not depend on a client-side math library after the
page loads.

Use Markdown/source mode in Pages CMS for code and equations:

````md
## A section

Inline math: $e^{i\pi} + 1 = 0$.

$$
\int_0^\infty e^{-x^2}dx = \frac{\sqrt{\pi}}{2}
$$

```typescript
export function greet(name: string) {
  return `Hello, ${name}`;
}
```
````

Guidelines:

- Do not add a Markdown `#` title; the frontmatter `title` becomes the page's
  `<h1>`.
- `##` and `###` headings are extracted into the article table of contents.
- Pages CMS's editor may not preview KaTeX exactly. Verify math locally or on
  the deployed page.
- Fenced code is highlighted during the build. The article script adds the
  visible language header and Copy button in the browser.
- Long highlighted code is configured to wrap.

## Pages CMS integration

### What Pages CMS does

Pages CMS reads `.pages.yml` from the selected repository and branch. The file
is its complete repository-side configuration. It exposes one `Posts`
collection backed by `src/content/posts/`.

When a user creates, edits, or deletes an entry, Pages CMS writes/deletes the
Markdown file and commits that operation to GitHub. Uploading an image similarly
commits the image file. There is no second copy of the content in a CMS
database.

The Pages CMS GitHub App installation and repository authorization are external
account state. They are not stored in this repository.

### Editor fields

`.pages.yml` exposes these fields:

- Title: required, maximum 120 characters.
- Description: required, maximum 240 characters.
- Publication date: required `yyyy-MM-dd` date.
- Updated date: optional date.
- Section: `blog` or `thought`, default `blog`.
- Tags: list of strings.
- Draft: default `true` in Pages CMS.
- Cover image: optional image from the configured post-image library.
- Body: required Markdown rich-text editor with visual/source switching.

Whenever a frontmatter field is added or changed, update **both** `.pages.yml`
and `src/content.config.ts`. The CMS and Astro must describe the same data.

The current config does not enable `settings.content.merge`. Pages CMS may
rewrite a structured post using only the configured fields. An Astro-only
frontmatter key that is missing from `.pages.yml` can therefore disappear the
next time that post is saved in Pages CMS.

### Creating a post

1. Sign in at [app.pagescms.org](https://app.pagescms.org/) with GitHub.
2. Open `anrbn/anrbn.github.io` and select branch `main`.
3. Open **Posts** and choose **Add an entry**.
4. Complete the required fields and write the body.
5. Keep **Draft** enabled while working, or disable it to publish.
6. Save. Pages CMS commits the Markdown file to `main`.
7. Wait for the newest **Deploy to GitHub Pages** workflow to succeed.

### Editing, unpublishing, and deleting

- Edit: open the entry, change it, and save. The existing file is updated.
- Unpublish without deleting: set **Draft** to true and save.
- Republish: set **Draft** to false and save.
- Delete: use the entry's action menu and delete it. Pages CMS commits deletion
  of the Markdown file; the next deployment removes the route.
- Recover a deletion: restore the file from Git history and push it to `main`.

Deleting a post does not necessarily delete images it used. Remove unused media
separately only after confirming nothing else references it.

Configured CMS commit-message templates are:

```text
Publish <filename> via Pages CMS
Update <filename> via Pages CMS
Remove <filename> via Pages CMS
```

The word `Publish` in a commit message does not control visibility. Only the
`draft` field does.

### Media

The named `post_images` source maps:

```text
Repository file: public/images/posts/example.webp
Public URL:       /images/posts/example.webp
Live URL:         https://anrbn.github.io/images/posts/example.webp
```

Allowed formats are PNG, JPG/JPEG, WebP, AVIF, GIF, and SVG. `rename: safe`
slugifies unsafe uploaded filenames. The media source is shared by the cover
image field and body editor.

An uploaded image lives under `public/`, so its direct URL can be deployed even
when the post that references it is a draft. Do not upload private assets.

The `image` frontmatter value is currently used for Open Graph and Twitter card
metadata. It is not rendered as a visible article cover.

## Rendering architecture

### Homepage

`src/pages/index.astro`:

1. Loads the `posts` collection.
2. Excludes drafts.
3. Converts filenames into `/posts/<slug>/` links.
4. Sorts posts by `pubDate`, newest first.
5. Splits entries by `kind` into Blogs and Thoughts.
6. Uses a small inline script to switch the visible list.

### Article pages

`src/pages/posts/[slug].astro` creates one static path for each non-draft post,
renders its Markdown, extracts headings, and passes everything to
`src/layouts/PostLayout.astro`.

`PostLayout.astro` provides:

- publication/updated dates, title, and description;
- desktop contents rail and accessible mobile drawer;
- `##`/`###` table of contents;
- active-section tracking while scrolling or following a hash link;
- code-block frames and Copy buttons;
- article metadata through `BaseLayout.astro`.

### Browser JavaScript

Reading the article, styled text, highlighted code, and rendered math all work
as static HTML/CSS. Small inline scripts progressively add:

- Blog/Thought tab switching on the homepage;
- mobile contents drawer focus/escape behavior;
- active table-of-contents highlighting;
- code-block frames and clipboard buttons.

There is no framework bundle or hydrated React component.

### Metadata and external assets

`BaseLayout.astro` emits the page title, description, canonical URL, Open Graph
metadata, Twitter metadata, favicon, and RSS discovery link. Canonical URLs use
the `site` value from `astro.config.mjs`.

Current external assets:

- Newsreader and Fragment Mono from Google Fonts.
- GitHub SVG icon from jsDelivr, linked in `SiteIdentity.astro`.

The visible `anirban.com` wordmark is currently branding and links to `/`; it
does not configure or prove ownership of that domain.

## GitHub Actions and GitHub Pages

The workflow is `.github/workflows/deploy.yml`.

### Trigger

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

Every push to `main` triggers a deployment, including a documentation-only
change, draft edit, or media upload. `workflow_dispatch` permits a manual rerun.
There is no path filter and no pull-request CI workflow.

### Build job

The build job:

1. Checks out the repository.
2. Uses `withastro/action@v6` with Node 24 and npm.
3. Installs locked dependencies.
4. Runs the project build.
5. Uploads `dist/` as the `github-pages` artifact.

The project build command is:

```text
astro check && astro build
```

This validates TypeScript/Astro/content data and then creates the static files.
It does **not** run `tests/site.test.mjs` in GitHub Actions.

### Deploy job

The deploy job waits for the build artifact and publishes it with
`actions/deploy-pages@v5` to the protected `github-pages` environment. The
workflow has the required minimal permissions:

```yaml
contents: read
pages: write
id-token: write
```

Deployments share the `pages` concurrency group and are not cancelled in
progress. Several rapid Pages CMS saves can therefore create several queued or
serial runs. Judge the live result only after the newest run succeeds.

GitHub repository settings must keep **Pages → Build and deployment → Source**
set to **GitHub Actions**. That setting, the deployment environment, Pages CMS
GitHub App authorization, and any DNS records are external state.

### Site URL configuration

`astro.config.mjs` currently contains:

```js
site: "https://anrbn.github.io",
output: "static",
```

Because `anrbn.github.io` is a GitHub user-site repository, it is hosted at the
domain root and needs no Astro `base` setting. The `site` value feeds canonical
links, social URLs, sitemap generation, and RSS.

## Local development and verification

Use Node 24 or newer.

```sh
npm ci
npm run dev
```

Astro normally serves local development at `http://localhost:4321`.

Available commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Astro development server |
| `npm run check` | Run Astro/TypeScript/content checks |
| `npm run build` | Check and generate `dist/` |
| `npm run preview` | Serve the generated build locally |
| `npm test` | Rebuild, then run Node smoke tests against `dist/` |
| `git diff --check` | Detect whitespace/patch errors |

Run `npm test` and `git diff --check` before pushing code or configuration
changes. A normal content-only Pages CMS edit relies on the Actions build.

The smoke tests confirm core generated routes/files and guard against the old
React implementation. They are not browser interaction or screenshot tests.

## Safe workflow for agents

Pages CMS may advance remote `main` at any moment. A clean local worktree does
not prove it is current.

Before editing:

```sh
git status --short --branch
git remote -v
git fetch github
git merge --ff-only github/main
```

Replace `github` with the actual remote name if different. If a branch cannot
fast-forward, inspect its history before doing anything else.

After editing:

```sh
npm test
git diff --check
git diff
git add <only-the-files-intentionally-changed>
git commit -m "Describe the change"
git fetch github
```

If Pages CMS advanced `main` after the local commit, integrate it without
discarding either side:

```sh
git rebase github/main
```

Inspect conflicts carefully, preserve the user's CMS content, and rerun tests.
Then push explicitly to production:

```sh
git push github HEAD:main
```

Rules:

- Never force-push.
- Never reset or overwrite a CMS commit to make the branch convenient.
- Stage only intended files; do not use a broad add in a dirty worktree.
- Preserve unrelated user changes.
- Do not assume the local branch named `main` is current.
- Check the newest Actions run after pushing.

Optional GitHub CLI monitoring:

```sh
gh run list --repo anrbn/anrbn.github.io --workflow deploy.yml --limit 5
gh run watch <run-id> --repo anrbn/anrbn.github.io --exit-status
gh run view <run-id> --repo anrbn/anrbn.github.io --log-failed
```

## Common changes

### Change branding or social links

- Site name/social target: `src/components/SiteIdentity.astro`.
- Default title/description and social metadata: `src/layouts/BaseLayout.astro`.
- RSS title/description: `src/pages/rss.xml.js`.
- Main visual tokens: `src/styles/global.css`.

Keep repeated names and descriptions synchronized.

### Add or change a content field

1. Update the Astro schema in `src/content.config.ts`.
2. Update the Pages CMS schema in `.pages.yml`.
3. Decide where it renders in the homepage/article/RSS/metadata.
4. Add or update build-output tests.
5. Test an old post and a newly created CMS-shaped post.

### Add a custom domain

No custom domain is currently configured. A complete migration normally
requires all of these:

1. Configure the custom domain in GitHub Pages repository settings.
2. Configure the required DNS records with the domain registrar/DNS provider.
3. Update `site` in `astro.config.mjs`.
4. Update the sitemap URL in `public/robots.txt`.
5. Add `public/CNAME` when appropriate so it is copied into the deployment.
6. Rebuild and verify canonical, social, RSS, sitemap, HTTPS, and redirect URLs.

Do not change only the visible `anirban.com` wordmark; that does not configure a
domain.

### Rename a published post

Changing the title is safe for the URL. Renaming its file is a URL migration.
There is no current redirect system, so either retain the filename or implement
and verify a redirect before renaming it.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Pages CMS cannot see the repository | GitHub App installation, repository authorization, selected account, and selected branch |
| CMS shows no Posts collection | `.pages.yml` exists at repository root on the selected branch and parses correctly |
| Saving creates no deployment | Confirm the commit landed on `main`, then check GitHub Actions is enabled |
| Build job fails | Read the first Astro/content-schema error; verify required fields, valid dates, enum values, and YAML indentation |
| Deploy job fails | Confirm GitHub Pages source is GitHub Actions and workflow permissions/environment remain intact |
| Workflow is green but a post is absent | Check `draft: false`, correct branch, and the newest workflow run |
| A post published earlier than expected | `pubDate` is not scheduling; set `draft: true` until release |
| Title changed but URL did not | Expected: URL comes from the filename |
| URL unexpectedly changed | The Markdown file was renamed; restore it or add a redirect |
| Equation is raw text or build fails | Use `$...$`/`$$...$$` in Markdown source and check delimiter/backslash syntax |
| Code language looks wrong | Use a supported fenced language identifier such as `typescript`, `javascript`, `python`, or `bash` |
| Cover image is not visible in article | Expected: `image` currently supplies social metadata only |
| Image is broken | Confirm it exists under `public/images/posts/` and content uses `/images/posts/...` |
| Old page appears after a green deploy | Hard-refresh, verify the newest run, or add a cache-busting query string |
| TOC omits a heading | Only Markdown `##` and `###` headings are included |
| TOC highlights the wrong heading | Inspect `PostLayout.astro` active-heading script and generated unique heading IDs |
| A docs-only change deployed the site | Expected: every push to `main` triggers the workflow |

A failed build does not erase the Git commit. GitHub Pages continues serving the
last successful deployment until a later workflow succeeds.

## Security and privacy boundaries

- The GitHub repository is public.
- Draft files and Git history are public.
- Files uploaded under `public/` are intended to become public.
- Do not commit tokens, secrets, private drafts, personal keys, or `.env` files.
- The production site needs no runtime secret or environment variable.
- Pages CMS authentication and GitHub App credentials are managed by those
  services, not stored here.

## Official references

- [Pages CMS introduction](https://pagescms.org/docs/)
- [Pages CMS configuration](https://pagescms.org/docs/configuration/)
- [Pages CMS collections](https://pagescms.org/docs/configuration/content/)
- [Pages CMS filenames](https://pagescms.org/docs/configuration/content/filename/)
- [Pages CMS media](https://pagescms.org/docs/configuration/media/)
- [Pages CMS settings](https://pagescms.org/docs/configuration/settings/)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Markdown configuration](https://docs.astro.build/en/guides/markdown-content/)
