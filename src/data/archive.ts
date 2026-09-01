export type ArchiveKind = "blog" | "thought";

export interface ArchivePost {
  title: string;
  date: string;
  dateTime: string;
  href: string;
  kind: ArchiveKind;
}

// These entries preserve the original proof-of-concept archive and links.
// New CMS posts are merged into the archive at build time.
export const legacyPosts: ArchivePost[] = [
  {
    title: "The shape of a good note.",
    date: "01 Sept 2026",
    dateTime: "2026-09-01",
    href: "/concepts/01-quiet-folio/index.html",
    kind: "blog",
  },
  {
    title: "Small enough to move.",
    date: "24 Aug 2026",
    dateTime: "2026-08-24",
    href: "/concepts/01-quiet-folio/index.html#small-enough",
    kind: "blog",
  },
  {
    title: "Context without ceremony.",
    date: "12 Aug 2026",
    dateTime: "2026-08-12",
    href: "/concepts/01-quiet-folio/index.html#context-without-ceremony",
    kind: "blog",
  },
  {
    title: "DSA requires systemic risk assessments covering illegal content, minor protection.",
    date: "02 Aug 2026",
    dateTime: "2026-08-02",
    href: "/concepts/01-quiet-folio/index.html",
    kind: "blog",
  },
  {
    title: "A small HTTP client, built in layers.",
    date: "28 Jul 2026",
    dateTime: "2026-07-28",
    href: "/concepts/01-quiet-folio/coding-in-layers.html",
    kind: "blog",
  },
  {
    title: "Notes on keeping less.",
    date: "08 Aug 2026",
    dateTime: "2026-08-08",
    href: "/concepts/01-quiet-folio/index.html#small-enough",
    kind: "thought",
  },
  {
    title: "Against the perfect system.",
    date: "29 Jul 2026",
    dateTime: "2026-07-29",
    href: "/concepts/01-quiet-folio/index.html#context-without-ceremony",
    kind: "thought",
  },
];
