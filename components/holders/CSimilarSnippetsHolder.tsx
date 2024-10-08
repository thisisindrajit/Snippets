import { Shapes } from "lucide-react";
import { FC, useEffect, useState } from "react";
import DialogHolder from "./DialogHolder";
import { Id } from "@/convex/_generated/dataModel";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { retryFunction } from "@/utilities/commonUtilities";
import { TSimilarSnippet } from "@/types/TSimilarSnippet";
import SimilarSnippetDetails from "../snippets/SimilarSnippetDetails";

const CSimilarSnippetsHolder: FC<{
  abstractEmbeddingId?: Id<"abstract_embeddings">;
  snippetTitle: string;
}> = ({ abstractEmbeddingId, snippetTitle }) => {
  const findSimilarSnippetsAction = useAction(
    api.similar_snippets_action.findSimilarSnippets
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [similarSnippets, setSimilarSnippets] = useState<TSimilarSnippet[]>([]);

  useEffect(() => {
    const getSimilarSnippets = async () => {
      let similarSnippets = [];
      try {
        similarSnippets = await retryFunction(() =>
          findSimilarSnippetsAction({
            abstractEmbeddingId: abstractEmbeddingId,
          })
        );

        setSimilarSnippets(similarSnippets);
      } catch (error) {
        console.error(
          `Error while fetching similar snippets for snippet with embedding id ${abstractEmbeddingId}`,
          error
        );
      }
      setIsLoading(false);
    };

    getSimilarSnippets(); // eslint-disable-line
  }, [findSimilarSnippetsAction, abstractEmbeddingId]);

  return (
    <DialogHolder
      dialogTrigger={
        <div className="flex items-center gap-1 justify-center bg-secondary/5 border border-secondary text-secondary py-1 px-2 sm:py-1.5 text-sm rounded-md cursor-pointer mt-0.5">
          <Shapes className="h-4 w-4" />
          <span className="hidden md:block">Show similar</span>
          <span className="md:hidden">Similar</span>
        </div>
      }
      title={`Similar to ${snippetTitle}`}
      className="h-[80%] sm:max-w-[85%] sm:max-h-[85%] flex flex-col gap-4"
    >
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center pb-20">
          Loading similar snippets ✨
        </div>
      ) : similarSnippets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-auto sm:px-2">
          {similarSnippets.map((similarSnippet, index) => (
            <SimilarSnippetDetails
              key={similarSnippet._id}
              position={index + 1}
              snippetId={similarSnippet._id}
              title={similarSnippet.title}
              abstract={similarSnippet.abstract}
              tags={similarSnippet.tags}
            />
          ))}
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center pb-20">
          No similar snippets found 😭
        </div>
      )}
    </DialogHolder>
  );
};

export default CSimilarSnippetsHolder;
