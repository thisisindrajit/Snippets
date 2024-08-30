import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Add snippet data
export const addSnippetData = mutation({
  args: {
    snippet_id: v.id("snippets"),
    type: v.optional(v.id("list_snippet_types")),
    data: v.any(), // Check if this can be changed to a more specific type
    references: v.optional(
      v.array(
        v.object({
          link: v.string(),
          title: v.string(),
          description: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const newSnippetAndDataTypeMappingId = await ctx.db.insert(
      "snippet_type_and_data_mapping",
      {
        snippet_id: args.snippet_id,
        type: args.type,
        data: args.data,
        references: args.references,
      }
    );

    return newSnippetAndDataTypeMappingId;
  },
});
