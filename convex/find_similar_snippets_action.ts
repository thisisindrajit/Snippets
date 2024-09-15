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

    if (!snippet || !snippet.abstract_embedding) {
      console.error(
        `Snippet with Id ${snippetId} not found and no similar snippets available.`
      );
      return [];
    }

    const similarSnippetIds = (
      await ctx.vectorSearch("snippets", "byAbstractEmbedding", {
        vector: snippet.abstract_embedding,
        limit: 6,
      })
    ).filter((doc) => doc._id !== snippetId);

    const result: TSimilarSnippet[] = (
      await Promise.all(
        similarSnippetIds.map(async (similarSnippet) => {
          const snippet: Doc<"snippets"> | null = await ctx.runQuery(
            api.snippets.getSnippetById,
            { snippetId: similarSnippet._id }
          );

          if (!snippet) {
            return null;
          }

          return {
            _id: snippet._id,
            title: snippet.title,
            abstract: snippet?.abstract ?? "No abstract found! 😢",
            tags: snippet?.tags ?? [],
          };
        })
      )
    ).filter((snippet) => snippet !== null) as TSimilarSnippet[];

    return result;
  },
});
