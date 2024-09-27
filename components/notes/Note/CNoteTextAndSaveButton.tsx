"use client";

import { FC, Fragment, KeyboardEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CNoteTextAndSaveButton: FC<{
  note: string;
  snippetId: Id<"snippets">;
  viewSnippetButton?: boolean;
}> = ({ note, snippetId, viewSnippetButton = false }) => {
  const { userId } = useAuth();
  const [prevNote, setPrevNote] = useState(note);
  const [currentNote, setCurrentNote] = useState(note);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const userByExternalId = useQuery(api.users.getUserByExternalId, {
    externalId: userId ?? undefined,
  });

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Run if shift + enter is pressed
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      await handleSaveNote();
    }
  };

  const noteMutation = useMutation(api.notes.upsertNote).withOptimisticUpdate(
    (localStore, args) => {
      const { note } = args;

      localStore.setQuery(
        api.notes.getNoteDetails,
        {
          snippetId: snippetId,
          notedBy: userByExternalId?._id,
        },
        {
          _id: crypto.randomUUID() as Id<"notes">,
          _creationTime: Date.now(),
          snippet_id: snippetId,
          note: note,
          noted_by: userByExternalId?._id as Id<"users">,
        }
      );
    }
  );

  const handleNote = async (note: string) => {
    await noteMutation({
      snippetId: snippetId,
      note: note,
      notedBy: userByExternalId?._id,
    });
  };

  const handleSaveNote = async () => {
    const prevNoteTrimmed = prevNote.trim();
    const updatedNoteTrimmed = currentNote.trim();

    setIsSavingNote(true);

    if (prevNoteTrimmed === updatedNoteTrimmed) {
      toast.info("Note is same as before! 😅");
      setIsSavingNote(false);
      return;
    }

    try {
      await handleNote(updatedNoteTrimmed);
      toast.success(`Note saved successfully! 📝`);

      setPrevNote(updatedNoteTrimmed);
    } catch (error) {
      toast.error("Failed to save note! 😢");
    }

    setIsSavingNote(false);
  };

  return (
    <Fragment>
      <Textarea
        placeholder="Type your notes here..."
        value={currentNote}
        onChange={(e) => {
          setCurrentNote(e.target.value);
        }}
        className="h-full resize-none text-base/loose"
        onKeyDown={(e) => handleKeyDown(e)}
      />
      <div className="flex gap-2 mx-auto mr-0 w-full sm:w-fit">
        <Button
          disabled={isSavingNote}
          onClick={isSavingNote ? () => {} : handleSaveNote}
          className="w-full sm:w-fit self-end"
        >
          {isSavingNote ? (
            "Saving note..."
          ) : (
            <Fragment>
              <span className="block md:hidden">Save note</span>
              <span className="hidden md:block">Save note (Shift + Enter)</span>
            </Fragment>
          )}
        </Button>
        {viewSnippetButton && (
          <Link
            href={`/snippet/${snippetId}`}
            className="bg-secondary/5 flex items-center justify-center gap-1.5 text-sm min-w-fit mx-auto mr-0 text-secondary p-2 sm:px-3 sm:py-2 rounded-md border border-secondary"
            target="_blank"
          >
            View snippet
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </Fragment>
  );
};

export default CNoteTextAndSaveButton;
