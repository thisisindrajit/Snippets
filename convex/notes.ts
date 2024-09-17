import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getSnippetById } from "./snippets";
import { Doc, Id } from "./_generated/dataModel";
import { IPaginationResult } from "../interfaces/IPaginationResult";

// Get notes by user Id
export const getNotesByUserId = query({
  args: {
    searchQuery: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    // console.log("Calling search for notes func"); // Testing if debounce is working
    let noteDetails: IPaginationResult<Doc<"notes">>;

    if (args.searchQuery && args.userId) {
      noteDetails = await ctx.db
        .query("notes")
        .withSearchIndex("searchNote", (q) =>
          q
            .search("note", args.searchQuery as string)
            .eq("noted_by", args.userId as Id<"users">)
        )
        .filter((q) => q.eq(q.field("noted_by"), args.userId))
        .filter((q) => q.neq(q.field("note"), "")) // Filter out empty notes
        .paginate(args.paginationOpts);
    } else {
      noteDetails = await ctx.db
        .query("notes")
        .filter((q) => q.eq(q.field("noted_by"), args.userId))
        .filter((q) => q.neq(q.field("note"), "")) // Filter out empty notes
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const snippetsForWhichNotesHaveBeenAdded = (
      await Promise.all(
        noteDetails.page.map(async (noteDetail) => {
          const snippet = await getSnippetById(ctx, {
            snippetId: noteDetail.snippet_id,
          });

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

    const result: IPaginationResult<
      Doc<"snippets"> & { note: string; noted_at: number }
    > = {
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
    if (!args.snippetId || !args.notedBy) {
      return null;
    }

    const note = await ctx.db
      .query("notes")
      .filter((q) => q.eq(q.field("snippet_id"), args.snippetId))
      .filter((q) => q.eq(q.field("noted_by"), args.notedBy))
      .first();

    return note;
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
    if (!args.notedBy) {
      throw new Error("notedBy argument not provided!");
    }

    const currentNote = await getNoteDetails(ctx, {
      snippetId: args.snippetId,
      notedBy: args.notedBy,
    });

    // If the note exists, update it, else insert a new note
    if (currentNote) {
      await ctx.db.patch(currentNote._id, {
        note: args.note,
      });
    } else {
      await ctx.db.insert("notes", {
        snippet_id: args.snippetId,
        note: args.note,
        noted_by: args.notedBy,
      });
    }

    return true;
  },
});
