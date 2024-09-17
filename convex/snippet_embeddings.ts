import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get snippet embedding by id
export const getSnippetEmbeddingById = query({
  args: { Id: v.optional(v.id("snippet_embeddings")) },
  handler: (ctx, args) => {
    if (!args.Id) {
      return null;
    }

    return ctx.db
      .query("snippet_embeddings")
      .filter((q) => q.eq(q.field("_id"), args.Id))
      .first();
  },
});

// Get snippet embedding by snippet id
export const getSnippetEmbeddingBySnippetId = query({
  args: { snippetId: v.optional(v.id("snippets")) },
  handler: (ctx, args) => {
    if (!args.snippetId) {
      return null;
    }

    return ctx.db
      .query("snippet_embeddings")
      .filter((q) => q.eq(q.field("snippet_id"), args.snippetId))
      .first();
  },
});

// Create a new snippet embedding
export const createSnippet = mutation({
  args: {
    snippet_id: v.id("snippets"),
    abstract: v.optional(v.string()),
    abstract_embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("snippet_embeddings", {
      snippet_id: args.snippet_id,
      abstract: args.abstract,
      abstract_embedding: args.abstract_embedding,
    });
  },
});
