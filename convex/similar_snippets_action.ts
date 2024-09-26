import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { TSimilarSnippet } from "../types/TSimilarSnippet";

export const findSimilarSnippets = action({
  args: { abstractEmbeddingId: v.optional(v.id("abstract_embeddings")) },
  handler: async (ctx, args) => {
    const { abstractEmbeddingId } = args;

    if(!abstractEmbeddingId) {
      console.error(`abstractEmbeddingId not provided!`);
      return [];
    }

    const abstractEmbedding: Doc<"abstract_embeddings"> | null =
      await ctx.runQuery(api.abstract_embeddings.getEmbeddingById, {
        embeddingId: abstractEmbeddingId,
      });

    if (!abstractEmbedding?.embedding) {
      console.error(`Abstract embedding not found for snippet!`);
      return [];
    }

    const similarEmbeddingsIds = (
      await ctx.vectorSearch("abstract_embeddings", "byAbstractEmbedding", {
        vector: abstractEmbedding.embedding,
        limit: 6,
      })
    ).filter((doc) => doc._id !== abstractEmbedding._id);

    const result: TSimilarSnippet[] = (
      await Promise.all(
        similarEmbeddingsIds.map(async (similarEmbedding) => {
          const snippet: Doc<"snippets"> | null = await ctx.runQuery(
            api.snippets.getSnippetByAbstractEmbeddingId,
            {
              abstractEmbeddingId: similarEmbedding._id,
            }
          );

          return snippet ? {
            _id: snippet._id,
            title: snippet.title,
            abstract: snippet?.abstract ?? "No abstract found! 😢",
            tags: snippet?.tags ?? [],
          } : null;
        })
      )
    ).filter((snippet) => snippet !== null) as TSimilarSnippet[];

    return result;
  },
});
