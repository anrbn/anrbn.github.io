import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = (await getCollection("posts", ({ data }) => !data.draft)).map((post) => ({
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate,
    link: `/posts/${post.id.replace(/\.(md|mdx)$/i, "")}/`,
  }));
  return rss({
    title: "Margin / Notes",
    description: "Essays and thoughts about attention, tools and everyday design.",
    site: context.site,
    items: posts.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()),
  });
}
