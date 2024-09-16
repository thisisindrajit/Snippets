import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { FC } from "react";
import { ArrowRight } from "lucide-react";

const SimilarSnippetDetails: FC<{
  snippetId: Id<"snippets">;
  position: number;
  title: string;
  abstract: string;
  tags: string[];
}> = ({ snippetId, position, title, abstract, tags }) => {
  return (
    <div className="border border-neutral-300 shadow-lg rounded-lg flex flex-col justify-between p-3 sm:p-4 gap-4 sm:gap-6">
      <div className="flex flex-col gap-3">
        <div
          className={`text-lg/loose sm:text-xl/relaxed font-medium underline decoration-dotted underline-offset-8 line-clamp-2 capitalize
            }`}
          title={title}
        >
          {position}. {title}
        </div>
        <div className="text-xs bg-accent text-accent-foreground py-1 px-2 w-fit rounded-lg">
          5W1H (AI generated)
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.length > 0 &&
            tags.slice(0, 5).map((tag, index) => {
              return (
                <div
                  key={index}
                  className="text-xs bg-primary/5 border border-primary font-medium text-primary py-1 px-2 w-fit rounded-lg"
                >
                  {tag}
                </div>
              );
            })}
        </div>
        <div className="text-sm/loose sm:text-base/loose text-justify">{abstract}</div>
      </div>
      <Link
        href={`/snippet/${snippetId}`}
        className="bg-secondary/10 flex items-center justify-center gap-1.5 text-sm w-full lg:w-fit mx-auto mr-0 text-secondary p-2 sm:px-3 sm:py-2 rounded-md border border-secondary"
        target="_blank"
      >
        View Snippet
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
};

export default SimilarSnippetDetails;
