import { FC } from "react";
import CNoteTextAndSaveButton from "./CNoteTextAndSaveButton";
import { convertToPrettyDateFormatInLocalTimezone } from "@/utilities/commonUtilities";
import { Id } from "@/convex/_generated/dataModel";

const Note: FC<{
  note: string;
  snippetId: string;
  lastNotedOn: Date;
  title: string;
}> = ({ note, lastNotedOn, snippetId, title }) => {
  return (
    <div className="border border-neutral-300 shadow-xl rounded-lg flex flex-col p-3 sm:p-4 gap-3 min-h-[24rem]">
      {/* Title and last noted at */}
      <div className="flex flex-col gap-2 w-fit">
        <div className="text-lg/relaxed sm:text-xl/relaxed font-medium underline decoration-dotted underline-offset-8">
          {title}
        </div>
      {lastNotedOn && (
        <div className="text-xs/loose sm:text-sm/loose text-secondary">
          Last noted{" "}
          <span className="font-semibold uppercase">
            {convertToPrettyDateFormatInLocalTimezone(lastNotedOn)}
          </span>
        </div>
      )}
      </div>
      <CNoteTextAndSaveButton
        note={note}
        snippetId={snippetId as Id<"snippets">}
        viewSnippetButton
      />
    </div>
  );
};

export default Note;
