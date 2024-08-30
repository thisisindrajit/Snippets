import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new snippet
export const createSnippet = mutation({
  args: {
    title: v.string(),
    likes_count: v.number(),
    generated_by_ai: v.boolean(),
    requested_by: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const newSnippetId = await ctx.db.insert("snippets", {
      title: args.title,
      likes_count: 0,
      generated_by_ai: args.generated_by_ai,
      requested_by: args.requested_by,
    });

    return newSnippetId;
  },
});
