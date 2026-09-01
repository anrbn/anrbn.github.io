"use client";

import { useState } from "react";

const posts = {
  blogs: [
    {
      number: "01",
      title: "The shape of a good note.",
      date: "01 Sept 2026",
      dateTime: "2026-09-01",
      href: "/concepts/01-quiet-folio/index.html",
    },
    {
      number: "02",
      title: "Small enough to move.",
      date: "24 Aug 2026",
      dateTime: "2026-08-24",
      href: "/concepts/01-quiet-folio/index.html#small-enough",
    },
    {
      number: "03",
      title: "Context without ceremony.",
      date: "12 Aug 2026",
      dateTime: "2026-08-12",
      href: "/concepts/01-quiet-folio/index.html#context-without-ceremony",
    },
    {
      number: "04",
      title: "DSA requires systemic risk assessments covering illegal content, minor protection.",
      date: "02 Aug 2026",
      dateTime: "2026-08-02",
      href: "/concepts/01-quiet-folio/index.html",
    },
    {
      number: "05",
      title: "A small HTTP client, built in layers.",
      date: "28 Jul 2026",
      dateTime: "2026-07-28",
      href: "/concepts/01-quiet-folio/coding-in-layers.html",
    },
  ],
  thoughts: [
    {
      number: "01",
      title: "Notes on keeping less.",
      date: "08 Aug 2026",
      dateTime: "2026-08-08",
      href: "/concepts/01-quiet-folio/index.html#small-enough",
    },
    {
      number: "02",
      title: "Against the perfect system.",
      date: "29 Jul 2026",
      dateTime: "2026-07-29",
      href: "/concepts/01-quiet-folio/index.html#context-without-ceremony",
    },
  ],
};

type Category = keyof typeof posts;

export default function Home() {
  const [category, setCategory] = useState<Category>("blogs");

  return (
    <main className="archive-home">
      <div className="home-identity">
        <a className="home-mark" href="/" aria-current="page">
          anirban.com
        </a>
        <nav className="identity-social" aria-label="Social links">
          <a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg" alt="" width="16" height="16" />
          </a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg" alt="" width="16" height="16" />
          </a>
          <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/x.svg" alt="" width="16" height="16" />
          </a>
        </nav>
      </div>
      <div className="archive-wrap">
        <nav className="archive-tabs" aria-label="Post categories">
          <button
            type="button"
            aria-pressed={category === "blogs"}
            onClick={() => setCategory("blogs")}
          >
            Blogs
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            aria-pressed={category === "thoughts"}
            onClick={() => setCategory("thoughts")}
          >
            Thoughts
          </button>
        </nav>

        <ol className="post-list" aria-live="polite">
          {posts[category].map((post) => (
            <li key={`${category}-${post.number}`}>
              <a href={post.href}>
                <span className="post-number">{post.number}</span>
                <span className="post-title">{post.title}</span>
                <time dateTime={post.dateTime}>{post.date}</time>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
