import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { IPaginationResult } from "../interfaces/IPaginationResult";
import { Doc } from "./_generated/dataModel";
import { getSnippetById } from "./snippets";

// Get saved snippets by user ID
export const getSavedSnippetsByUserId = query({
  args: {
    userId: v.optional(v.id("users")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const saveDetails = await ctx.db
      .query("saves")
      .filter((q) => q.eq(q.field("saved_by"), args.userId))
      .order("desc")
      .paginate(args.paginationOpts);

    const savedSnippets = (await Promise.all(
      saveDetails.page.map(async (saveDetail) => {
        const snippet = await getSnippetById(ctx, {
          snippetId: saveDetail.snippet_id,
        });

        return snippet ? { ...snippet, saved_at: saveDetail._creationTime } : null;
      })
    )).filter((snippet) => snippet !== null) as (Doc<"snippets"> & { saved_at: number })[];

    const result: IPaginationResult<
      Doc<"snippets"> & { saved_at: number }
    > = {
      page: savedSnippets,
      isDone: saveDetails.isDone,
      continueCursor: saveDetails.continueCursor,
      splitCursor: saveDetails.splitCursor,
      pageStatus: saveDetails.pageStatus,
    };

    return result;
  },
});

export const getSnippets = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("snippets")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Get save details
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
