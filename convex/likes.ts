import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getLikeDetails = query({
  args: {
    snippetId: v.optional(v.id("snippets")),
    likedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.snippetId || !args.likedBy) {
      return null;
    }

    const likedSnippet = await ctx.db
      .query("likes")
      .filter((q) => q.eq(q.field("snippet_id"), args.snippetId))
      .filter((q) => q.eq(q.field("liked_by"), args.likedBy))
      .first();

    return likedSnippet;
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
    if (!args.modifiedBy) {
      throw new Error("modifiedBy argument not provided!");
    }

    const currentSnippet = await ctx.db.get(args.snippetId);

    if (args.isLiked) {
      await Promise.all([
        ctx.db.insert("likes", {
          snippet_id: args.snippetId,
          liked_by: args.modifiedBy,
        }),
        currentSnippet &&
          ctx.db.patch(args.snippetId, {
            likes_count: currentSnippet.likes_count + 1,
          }),
      ]);
    } else {
      const likeDetails = await getLikeDetails(ctx, {
        snippetId: args.snippetId,
        likedBy: args.modifiedBy,
      });

      await Promise.all([
        likeDetails &&
          likeDetails._id &&
          (await ctx.db.delete(likeDetails._id)),
        currentSnippet &&
          ctx.db.patch(args.snippetId, {
            likes_count: currentSnippet.likes_count - 1,
          }),
      ]);
    }

    return true;
  },
});
