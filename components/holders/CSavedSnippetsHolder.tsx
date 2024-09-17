"use client";

import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { api } from "@/convex/_generated/api";
import { useStablePaginatedQuery } from "@/hooks/useStablePaginatedQuery";
import CSnippet from "../CSnippet";
import { Authenticated, AuthLoading, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";

const CSavedSnippetsHolder = () => {
  const { ref, inView } = useInView();
  const { userId } = useAuth();
  const userByExternalId = useQuery(api.users.getUserByExternalId, {
    externalId: userId ?? undefined,
  });

  const { results, status, loadMore } = useStablePaginatedQuery(
    api.saves.getSavedSnippetsByUserId,
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
    if (inView) {
      loadMore(parseInt(process.env.NEXT_PUBLIC_NO_OF_RECORDS_TO_TAKE ?? "5"));
    }
  }, [loadMore, inView]);

  return (
    <Fragment>
      <AuthLoading>
        <div className="w-full text-center my-2">
          Checking if you are authenticated 🧐
        </div>
      </AuthLoading>
      <Authenticated>
        {status === "LoadingFirstPage" ? (
          <div className="w-full text-center my-2">
            Loading saved snippets 🔖
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {results.length === 0 ? (
              <div className="w-full text-center my-2">
                No saved snippets! 😭
              </div>
            ) : (
              <Fragment>
                {results.map((snippet) => {
                  return (
                    <CSnippet
                      key={snippet._id}
                      snippetId={snippet._id}
                      title={snippet.title}
                      savedOn={new Date(snippet.saved_at)}
                      requestedBy={snippet.requested_by}
                      requestorName={snippet.requestor_name}
                      requestedOn={new Date(snippet._creationTime)}
                      what={
                        snippet.data["what"]?.length > 0
                          ? snippet.data["what"]
                          : []
                      }
                      why={
                        snippet.data["why"]?.length > 0
                          ? snippet.data["why"]
                          : []
                      }
                      when={
                        snippet.data["when"]?.length > 0
                          ? snippet.data["when"]
                          : []
                      }
                      where={
                        snippet.data["where"]?.length > 0
                          ? snippet.data["where"]
                          : []
                      }
                      how={
                        snippet.data["how"]?.length > 0
                          ? snippet.data["how"]
                          : []
                      }
                      amazingFacts={
                        snippet.data["amazingfacts"]?.length > 0
                          ? snippet.data["amazingfacts"]
                          : []
                      }
                      references={snippet?.references ?? []}
                      tags={snippet?.tags ?? []}
                      likesCount={snippet.likes_count}
                    />
                  );
                })}
              </Fragment>
            )}
            <div ref={ref} className="w-full text-center my-2">
              {status === "CanLoadMore" || status === "LoadingMore"
                ? `Loading more snippets ✨`
                : results.length > 0 &&
                  status === "Exhausted" &&
                  "All saved snippets viewed! 🎉"}
            </div>
          </div>
        )}
      </Authenticated>
    </Fragment>
  );
};

export default CSavedSnippetsHolder;
