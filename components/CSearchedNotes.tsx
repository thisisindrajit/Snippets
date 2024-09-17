import { api } from "@/convex/_generated/api";
import { useStablePaginatedQuery } from "@/hooks/useStablePaginatedQuery";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { FC, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Note from "./Note";

const CSearchedNotes: FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const { userId } = useAuth();
  const userByExternalId = useQuery(api.users.getUserByExternalId, {
    externalId: userId ?? undefined,
  });
  const { ref, inView } = useInView();
  const { results, status, loadMore } = useStablePaginatedQuery(
    api.notes.getNotesByUserId,
    {
      searchQuery: searchQuery,
      userId: userByExternalId?._id,
    },
    {
      initialNumItems: parseInt(
        process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? "5"
      ),
    }
  );

  useEffect(() => {
    if (inView) {
      loadMore(parseInt(process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? "5"));
    }
  }, [loadMore, inView]);

  return status === "LoadingFirstPage" ? (
    <div className="w-full text-center my-2">
      Searching for notes with{" "}
      <span className="font-medium italic">{searchQuery}</span> 📝
    </div>
  ) : (
    <div className="flex flex-col gap-6">
      {results.length === 0 ? (
        <div className="w-full text-center my-2">No notes! 😭</div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="text-lg md:text-xl text-primary mt-4">
            Search results for{" "}
            <span className="font-medium italic">{searchQuery}</span>
          </div>
          <div className="flex flex-col gap-6">
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
          </div>
        </div>
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

export default CSearchedNotes;
