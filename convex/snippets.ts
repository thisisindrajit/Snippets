import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get snippets
export const getSnippets = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("snippets")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Get snippet by Id
export const getSnippetById = query({
  args: { snippetId: v.optional(v.id("snippets")) },
  handler: (ctx, args) => {
    if (!args.snippetId) {
      return null;
    }

    return ctx.db
      .query("snippets")
      .filter((q) => q.eq(q.field("_id"), args.snippetId))
      .first();
  },
});

// Create a new snippet
export const createSnippet = mutation({
  args: {
    title: v.string(),
    likes_count: v.number(),
    requested_by: v.optional(v.id("users")),
    requestor_name: v.string(),
    type: v.optional(v.id("list_snippet_types")),
    data: v.any(),
    references: v.optional(
      v.array(
        v.object({
          link: v.string(),
          title: v.string(),
          description: v.string(),
        })
      )
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const newSnippetId = await ctx.db.insert("snippets", {
      title: args.title,
      likes_count: 0,
      requested_by: args.requested_by,
      requestor_name: args.requestor_name,
      type: args.type,
      data: args.data,
      references: args.references,
      tags: args.tags
    });

    return newSnippetId;
  },
});