"use client";

import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { api } from "@/convex/_generated/api";
import { useStablePaginatedQuery } from "@/hooks/useStablePaginatedQuery";
import { Authenticated, AuthLoading, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import Note from "../Note";

const CNotesHolder = () => {
  const { ref, inView } = useInView();
  const { userId } = useAuth();
  const userByExternalId = useQuery(api.users.getUserByExternalId, {
    externalId: userId ?? undefined,
  });

  const { results, status, loadMore } = useStablePaginatedQuery(
    api.notes.getNotesByUserId,
    {
      userId: userByExternalId?._id,
    },
    {
      initialNumItems: parseInt(
        process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? "10"
      ),
    }
  );

  useEffect(() => {
    if (inView) {
      loadMore(parseInt(process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? "10"));
    }
  }, [loadMore, inView]);

  return (
    <Fragment>
      <AuthLoading>
        <div className="w-full text-center my-2">Loading notes 📝</div>
      </AuthLoading>
      <Authenticated>
        {status === "LoadingFirstPage" ? (
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
        )}
      </Authenticated>
    </Fragment>
  );
};

export default CNotesHolder;
