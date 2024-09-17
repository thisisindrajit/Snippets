import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { TSimilarSnippet } from "../types/TSimilarSnippet";

export const findSimilarSnippets = action({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    const { snippetId } = args;

    const snippet: Doc<"snippets"> | null = await ctx.runQuery(
      api.snippets.getSnippetById,
      { snippetId: snippetId }
    );

    const snippetEmbedding: Doc<"snippet_embeddings"> | null =
      await ctx.runQuery(
        api.snippet_embeddings.getSnippetEmbeddingBySnippetId,
        { snippetId: snippetId }
      );

    if (!snippet || !snippetEmbedding?.abstract_embedding) {
      console.error(
        `Snippet with Id ${snippetId} not found or no embedding found!`
      );
      return [];
    }

    const similarSnippeEmbeddingIds = (
      await ctx.vectorSearch("snippet_embeddings", "byAbstractEmbedding", {
        vector: snippetEmbedding.abstract_embedding,
        limit: 6,
      })
    ).filter((doc) => doc._id !== snippetEmbedding._id);

    const result: TSimilarSnippet[] = (
      await Promise.all(
        similarSnippeEmbeddingIds.map(async (similarSnippet) => {
          const similarSnippetEmbedding = await ctx.runQuery(
            api.snippet_embeddings.getSnippetEmbeddingById,
            {
              Id: similarSnippet._id,
            }
          );

          const snippet: Doc<"snippets"> | null = await ctx.runQuery(
            api.snippets.getSnippetById,
            { snippetId: similarSnippetEmbedding?.snippet_id }
          );

          if (!snippet) {
            return null;
          }

          return {
            _id: snippet._id,
            title: snippet.title,
            abstract: similarSnippetEmbedding?.abstract ?? "No abstract found! 😢",
            tags: snippet?.tags ?? [],
          };
        })
      )
    ).filter((snippet) => snippet !== null) as TSimilarSnippet[];

    return result;
  },
});
