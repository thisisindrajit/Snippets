import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FC } from "react";
import { fetchQuery } from "convex/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import CSnippet from "@/components/CSnippet";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { snippetId: string };
}): Promise<Metadata> {
  const { snippetId } = params;

  const snippet = await fetchQuery(api.snippets.getSnippetById, {
    snippetId: snippetId as Id<"snippets">,
  });

  return {
    title: snippet ? `Snippet about ${snippet.title}` : "No snippet found!",
    description: snippet?.abstract ?? "No snippet found!",
  };
}

const Snippet: FC<{
  params: { snippetId: string };
}> = async ({ params }) => {
  const { snippetId } = params;

  if (!snippetId) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  const snippet = await fetchQuery(api.snippets.getSnippetById, {
    snippetId: snippetId as Id<"snippets">,
  });

  if (!snippet) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  return (
    <div className="flex flex-col gap-4 w-full 2xl:w-[90%] mx-auto">
      <Link href={`/user/dashboard`}>
        <Button
          variant="outline"
          className="flex gap-2 items-center justify-center"
        >
          <LayoutDashboard className="h-4 w-4" />
          Go to trending snippets
        </Button>
      </Link>
      <CSnippet
        key={snippet._id}
        snippetId={snippet._id}
        title={snippet.title}
        requestedBy={snippet.requested_by}
        requestorName={snippet.requestor_name}
        requestedOn={new Date(snippet._creationTime)}
        what={snippet.data["what"]?.length > 0 ? snippet.data["what"] : []}
        why={snippet.data["why"]?.length > 0 ? snippet.data["why"] : []}
        when={snippet.data["when"]?.length > 0 ? snippet.data["when"] : []}
        where={snippet.data["where"]?.length > 0 ? snippet.data["where"] : []}
        how={snippet.data["how"]?.length > 0 ? snippet.data["how"] : []}
        amazingFacts={
          snippet.data["amazingfacts"]?.length > 0
            ? snippet.data["amazingfacts"]
            : []
        }
        references={snippet?.references ?? []}
        tags={snippet?.tags ?? []}
        showLinkIcon={false}
        likesCount={snippet.likes_count}
      />
    </div>
  );
};

export default Snippet;
