import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSaveDetails = query({
  args: {
    snippetId: v.optional(v.id("snippets")),
    savedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.snippetId || !args.savedBy) {
      return null;
    }

    const savedSnippet = await ctx.db
      .query("saves")
      .filter((q) => q.eq(q.field("snippet_id"), args.snippetId))
      .filter((q) => q.eq(q.field("saved_by"), args.savedBy))
      .first();

    return savedSnippet;
  },
});

// Save/Unsave a snippet
export const saveOrUnsaveSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
    isSaved: v.boolean(),
    modifiedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.modifiedBy) {
      throw new Error("modifiedBy argument not provided!");
    }

    if (args.isSaved) {
      const currentSnippet = await ctx.db.get(args.snippetId);

      currentSnippet &&
        (await ctx.db.insert("saves", {
          snippet_id: args.snippetId,
          saved_by: args.modifiedBy,
        }));
    } else {
      const saveDetails = await getSaveDetails(ctx, {
        snippetId: args.snippetId,
        savedBy: args.modifiedBy,
      });

      saveDetails && saveDetails._id && (await ctx.db.delete(saveDetails._id));
    }

    return true;
  },
});
