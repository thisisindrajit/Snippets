import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get new and trending snippets
export const getNewAndTrendingSnippets = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { paginationOpts } = args;

    return await ctx.db
      .query("snippets")
      .order("desc")
      .paginate(paginationOpts);
  },
});

// Get top n trending snippets
export const getTopNTrendingSnippets = query({
  args: { count: v.number() },
  handler: async (ctx, args) => {
    const { count } = args;

    return await ctx.db
      .query("snippets")
      .withIndex("byLikesCount")
      .order("desc")
      .take(count || 5);
  },
});

// Get snippet by Id
export const getSnippetById = query({
  args: { snippetId: v.optional(v.id("snippets")) },
  handler: async (ctx, args) => {
    const { snippetId } = args;

    if (!snippetId) {
      console.error("snippetId not provided!");
      return null;
    }

    return await ctx.db.get(snippetId);
  },
});

// Get snippet by abstract embedding Id
export const getSnippetByAbstractEmbeddingId = query({
  args: { abstractEmbeddingId: v.optional(v.id("abstract_embeddings")) },
  handler: async (ctx, args) => {
    const { abstractEmbeddingId } = args;

    if (!abstractEmbeddingId) {
      console.error("abstractEmbeddingId not provided!");
      return null;
    }

    return await ctx.db
      .query("snippets")
      .withIndex("byAbstractEmbeddingId", (q) =>
        q.eq("abstract_embedding_id", abstractEmbeddingId)
      )
      .unique();
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
    model_used: v.optional(v.string()),
    topic_generated: v.optional(v.string()),
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
    abstract: v.optional(v.string()),
    abstract_embedding_id: v.optional(v.id("abstract_embeddings")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const {
      title,
      requested_by,
      requestor_name,
      type,
      model_used,
      topic_generated,
      data,
      references,
      abstract,
      abstract_embedding_id,
      tags,
    } = args;

    return await ctx.db.insert("snippets", {
      title: title,
      likes_count: 0,
      requested_by: requested_by,
      requestor_name: requestor_name,
      type: type,
      model_used: model_used,
      topic_generated: topic_generated,
      data: data,
      references: references,
      abstract: abstract,
      abstract_embedding_id: abstract_embedding_id,
      tags: tags,
    });
  },
});
