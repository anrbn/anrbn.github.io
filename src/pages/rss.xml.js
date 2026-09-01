import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { legacyPosts } from "../data/archive";

export async function GET(context) {
  const posts = (await getCollection("posts", ({ data }) => !data.draft)).map((post) => ({
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate,
    link: `/posts/${post.id.replace(/\.(md|mdx)$/i, "")}/`,
  }));
  const legacy = legacyPosts.map((post) => ({
    title: post.title,
    description: post.title,
    pubDate: new Date(`${post.dateTime}T00:00:00Z`),
    link: post.href,
  }));

  return rss({
    title: "Margin / Notes",
    description: "Essays and thoughts about attention, tools and everyday design.",
    site: context.site,
    items: [...posts, ...legacy].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()),
  });
}
