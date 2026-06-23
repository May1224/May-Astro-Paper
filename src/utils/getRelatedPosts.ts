import type { CollectionEntry } from "astro:content";

export function getRelatedPosts(
  currentPost: CollectionEntry<"posts">,
  posts: CollectionEntry<"posts">[],
  limit = 2
) {
  const currentTags = new Set(
    currentPost.data.tags.map(tag => tag.toLocaleLowerCase())
  );

  return posts
    .filter(post => post.id !== currentPost.id)
    .map(post => ({
      post,
      score: post.data.tags.reduce(
        (total, tag) =>
          total + (currentTags.has(tag.toLocaleLowerCase()) ? 1 : 0),
        0
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.post.data.modDatetime ?? b.post.data.pubDatetime).getTime() -
          new Date(a.post.data.modDatetime ?? a.post.data.pubDatetime).getTime()
    )
    .slice(0, limit)
    .map(({ post }) => post);
}
