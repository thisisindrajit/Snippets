import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get embedding by id
export const getEmbeddingById = query({
  args: {
    embeddingId: v.id("abstract_embeddings"),
  },
  handler: async (ctx, args) => {
    const { embeddingId } = args;

    return await ctx.db.get(embeddingId);
  },
});

// Create a new abstract embedding
export const createAbstractEmbedding = mutation({
  args: {
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const abstractEmbeddingId = await ctx.db.insert("abstract_embeddings", {
      embedding: args.embedding,
    });

    return abstractEmbeddingId;
  },
});
