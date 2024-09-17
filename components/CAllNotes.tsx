import { api } from "@/convex/_generated/api";
import { useStablePaginatedQuery } from "@/hooks/useStablePaginatedQuery";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Dispatch, FC, Fragment, SetStateAction, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Note from "./Note";

const CAllNotes: FC<{
  setNotesCount: Dispatch<SetStateAction<number | null>>;
}> = ({ setNotesCount }) => {
  const { userId } = useAuth();
  const userByExternalId = useQuery(api.users.getUserByExternalId, {
    externalId: userId ?? undefined,
  });
  const { ref, inView } = useInView();
  const { results, status, loadMore } = useStablePaginatedQuery(
    api.notes.getNotesByUserId,
    {
      userId: userByExternalId?._id,
    },
    {
      initialNumItems: parseInt(
        process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? "5"
      ),
    }
  );

  useEffect(() => {
    setNotesCount(results.length);
  }, [results, setNotesCount]);

  useEffect(() => {
    if (inView) {
      loadMore(parseInt(process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? "5"));
    }
  }, [loadMore, inView]);

  return status === "LoadingFirstPage" ? (
    <div className="w-full text-center my-2">Loading notes 📝</div>
  ) : (
    <div className="flex flex-col gap-6">
      {results.length === 0 ? (
        <div className="w-full text-center my-2">No notes! 😭</div>
      ) : (
        <Fragment>
          {results.map((snippetNote) => {
            return (
              <Note
                key={snippetNote._id}
                snippetId={snippetNote._id}
                note={snippetNote.note}
                title={snippetNote.title}
                lastNotedOn={new Date(snippetNote.noted_at)}
              />
            );
          })}
        </Fragment>
      )}
      <div ref={ref} className="w-full text-center my-2">
        {status === "CanLoadMore" || status === "LoadingMore"
          ? `Loading more notes ✨`
          : results.length > 0 &&
            status === "Exhausted" &&
            "All notes viewed! 🎉"}
      </div>
    </div>
  );
};

export default CAllNotes;
