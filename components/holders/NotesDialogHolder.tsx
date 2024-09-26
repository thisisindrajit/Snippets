import { NotepadText } from "lucide-react";
import { FC } from "react";
import CNoteTextAndSaveButton from "../notes/Note/CNoteTextAndSaveButton";
import DialogHolder from "./DialogHolder";
import { Id } from "@/convex/_generated/dataModel";

const NotesDialogHolder: FC<{
  snippetId: Id<"snippets">;
  snippetTitle: string;
  note?: string;
}> = ({ snippetId, snippetTitle, note }) => {
  return (
    <DialogHolder
      dialogTrigger={
        <div className="border border-primary text-primary p-2 h-full flex items-center justify-center rounded-md cursor-pointer gap-1.5 text-sm">
          <NotepadText className="h-4 w-4" />
          {note ? "View" : "Create"} note
        </div>
      }
      title={`Notes for ${snippetTitle}`}
      className="h-[80%] sm:max-w-[75%] sm:max-h-[80%] flex flex-col justify-between gap-3"
      noChildrenContainer
    >
      <div className="text-sm/relaxed">
        Take notes for this snippet and refer them later. Make sure to save your
        notes{" "}
        <span className="hidden md:inline">
          by pressing <span className="font-medium italic">Shift + enter</span>
        </span>{" "}
        😁
      </div>
      <CNoteTextAndSaveButton note={note ?? ""} snippetId={snippetId} />
    </DialogHolder>
  );
};

export default NotesDialogHolder;
