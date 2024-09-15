import { NotepadText } from "lucide-react";
import { FC } from "react";
import CNoteTextAndSaveButton from "../Note/CNoteTextAndSaveButton";
import DialogHolder from "./DialogHolder";
import { Id } from "@/convex/_generated/dataModel";

const NotesDialogHolder: FC<{
  snippetId: Id<"snippets">;
  snippetTitle: string;
  note: string;
}> = ({ snippetId, snippetTitle, note }) => {
  return (
    <DialogHolder
      dialogTrigger={
        <div className="border border-primary text-primary p-2 h-full aspect-square flex items-center justify-center rounded-md cursor-pointer">
          <NotepadText className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      }
      title={`Notes for ${snippetTitle}`}
      className="h-[80%] sm:max-w-[75%] sm:max-h-[80%] overflow-auto flex flex-col justify-between gap-4 rounded-md"
    >
      <div>
        Take notes for this snippet and refer them later. Make sure to save your
        notes 😁
      </div>
      <CNoteTextAndSaveButton note={note} snippetId={snippetId} />
    </DialogHolder>
  );
};

export default NotesDialogHolder;
