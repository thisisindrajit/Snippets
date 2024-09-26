import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { IPaginationResult } from "../interfaces/IPaginationResult";
import { Doc } from "./_generated/dataModel";

// Get saved snippets by user Id
export const getSavedSnippetsByUserId = query({
  args: {
    userId: v.optional(v.id("users")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { userId, paginationOpts } = args;
    let result: IPaginationResult<Doc<"snippets"> & { saved_at: number }> = {
      page: [],
      isDone: true,
      continueCursor: "",
    };

    if (!userId) {
      console.error("userId not provided!");
      return result;
    }

    const saveDetails = await ctx.db
      .query("saves")
      .withIndex("bySavedBy", (q) => q.eq("saved_by", userId))
      .order("desc")
      .paginate(paginationOpts);

    const savedSnippets = (
      await Promise.all(
        saveDetails.page.map(async (saveDetail) => {
          const snippet = await ctx.db.get(saveDetail.snippet_id);

          return snippet
            ? { ...snippet, saved_at: saveDetail._creationTime }
            : null;
        })
      )
    ).filter((snippet) => snippet !== null) as (Doc<"snippets"> & {
      saved_at: number;
    })[];

    result = {
      page: savedSnippets,
      isDone: saveDetails.isDone,
      continueCursor: saveDetails.continueCursor,
      splitCursor: saveDetails.splitCursor,
      pageStatus: saveDetails.pageStatus,
    };

    return result;
  },
});

// Get save details
export const getSaveDetails = query({
  args: {
    snippetId: v.optional(v.id("snippets")),
    savedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { snippetId, savedBy } = args;

    if (!snippetId || !savedBy) {
      console.error("snippetId or savedBy not provided!");
      return null;
    }

    return await ctx.db
      .query("saves")
      .withIndex("bySnippetIdAndSavedBy", (q) =>
        q.eq("snippet_id", snippetId).eq("saved_by", savedBy)
      )
      .unique();
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
    const { snippetId, isSaved, modifiedBy } = args;

    if (!modifiedBy) {
      console.error("modifiedBy argument not provided!");
      return false;
    }

    // If the snippet is saved, insert a new save record, else delete the existing save record
    if (isSaved) {
      await ctx.db.insert("saves", {
        snippet_id: snippetId,
        saved_by: modifiedBy,
      });
    } else {
      const saveDetails = await getSaveDetails(ctx, {
        snippetId: snippetId,
        savedBy: modifiedBy,
      });

      saveDetails?._id && (await ctx.db.delete(saveDetails._id));
    }

    return true;
  },
});
