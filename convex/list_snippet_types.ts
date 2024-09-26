import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSnippetTypeDetails = query({
  args: {
    snippetType: v.string(),
  },
  handler: async (ctx, args) => {
    const { snippetType } = args;

    return await ctx.db
      .query("list_snippet_types")
      .filter((q) => q.eq(q.field("snippet_type"), snippetType))
      .unique();
  },
});
