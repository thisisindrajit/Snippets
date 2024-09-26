import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getLikeDetails = query({
  args: {
    snippetId: v.optional(v.id("snippets")),
    likedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { snippetId, likedBy } = args;

    // If snippetId or likedBy is not provided, return null
    if (!snippetId || !likedBy) {
      console.error("snippetId or likedBy not provided!");
      return null;
    }

    return await ctx.db
      .query("likes")
      .withIndex("bySnippetIdAndLikedBy", (q) =>
        q.eq("snippet_id", snippetId).eq("liked_by", likedBy)
      )
      .unique();
  },
});

// Like/Unlike a snippet
export const likeOrUnlikeSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
    isLiked: v.boolean(),
    modifiedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { snippetId, isLiked, modifiedBy } = args;

    if (!modifiedBy) {
      console.error("modifiedBy not provided!");
      return false;
    }

    const currentSnippet = await ctx.db.get(snippetId);

    // If the snippet is liked, insert a new like record, else delete the existing like record
    if (isLiked) {
      await Promise.all([
        ctx.db.insert("likes", {
          snippet_id: snippetId,
          liked_by: modifiedBy,
        }),
        currentSnippet &&
          ctx.db.patch(currentSnippet._id, {
            likes_count: currentSnippet.likes_count + 1,
          }),
      ]);
    } else {
      const likeDetails = await getLikeDetails(ctx, {
        snippetId: snippetId,
        likedBy: modifiedBy,
      });

      await Promise.all([
        likeDetails?._id && (await ctx.db.delete(likeDetails._id)),
        currentSnippet &&
          ctx.db.patch(currentSnippet._id, {
            likes_count: currentSnippet.likes_count - 1,
          }),
      ]);
    }

    return true;
  },
});
