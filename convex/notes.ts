import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { Doc } from "./_generated/dataModel";
import { IPaginationResult } from "../interfaces/IPaginationResult";

// Get notes by user Id
export const getNotesByUserId = query({
  args: {
    searchQuery: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const { searchQuery, userId, paginationOpts } = args;
    let result: IPaginationResult<
      Doc<"snippets"> & { note: string; noted_at: number }
    > = {
      page: [],
      isDone: true,
      continueCursor: "",
    };

    // If userId is not provided, return null
    if (!userId) {
      console.error("userId not provided!");
      return result;
    }

    let noteDetails: IPaginationResult<Doc<"notes">>;

    if (searchQuery && userId) {
      noteDetails = await ctx.db
        .query("notes")
        .withSearchIndex("searchNote", (q) =>
          q.search("note", searchQuery).eq("noted_by", userId)
        )
        .filter((q) => q.neq(q.field("note"), "")) // Filter out empty notes
        .paginate(paginationOpts);
    } else {
      noteDetails = await ctx.db
        .query("notes")
        .withIndex("byNotedby", (q) => q.eq("noted_by", userId))
        .filter((q) => q.neq(q.field("note"), "")) // Filter out empty notes
        .order("desc")
        .paginate(paginationOpts);
    }

    const snippetsForWhichNotesHaveBeenAdded = (
      await Promise.all(
        noteDetails.page.map(async (noteDetail) => {
          const snippet = await ctx.db.get(noteDetail.snippet_id);

          return snippet
            ? {
                ...snippet,
                note: noteDetail.note,
                noted_at: noteDetail._creationTime,
              }
            : null;
        })
      )
    ).filter((snippet) => snippet !== null) as (Doc<"snippets"> & {
      note: string;
      noted_at: number;
    })[];

    result = {
      page: snippetsForWhichNotesHaveBeenAdded,
      isDone: noteDetails.isDone,
      continueCursor: noteDetails.continueCursor,
      splitCursor: noteDetails.splitCursor,
      pageStatus: noteDetails.pageStatus,
    };

    return result;
  },
});

// Get note details
export const getNoteDetails = query({
  args: {
    snippetId: v.optional(v.id("snippets")),
    notedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { snippetId, notedBy } = args;

    // If snippetId or notedBy is not provided, return null
    if (!snippetId || !notedBy) {
      console.error("snippetId or notedBy not provided!");
      return null;
    }

    return await ctx.db
      .query("notes")
      .withIndex("bySnippetIdAndNotedBy", (q) =>
        q.eq("snippet_id", snippetId).eq("noted_by", notedBy)
      )
      .unique();
  },
});

// Upsert note
export const upsertNote = mutation({
  args: {
    snippetId: v.id("snippets"),
    note: v.string(),
    notedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { snippetId, note, notedBy } = args;

    if (!notedBy) {
      console.error("notedBy argument not provided!");
      return false;
    }

    const currentNote = await getNoteDetails(ctx, {
      snippetId: snippetId,
      notedBy: notedBy,
    });

    // If the note exists, update it, else insert a new note
    if (currentNote) {
      await ctx.db.patch(currentNote._id, {
        note: note,
      });
    } else {
      await ctx.db.insert("notes", {
        snippet_id: snippetId,
        note: note,
        noted_by: notedBy,
      });
    }

    return true;
  },
});
