import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { FC } from "react";
import { fetchQuery } from "convex/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import CSnippet from "@/components/CSnippet";
import { Metadata } from "next";
import { revalidatePath } from "next/cache";

export async function generateMetadata({
  params,
}: {
  params: { snippetId: string };
}): Promise<Metadata> {
  const { snippetId } = params;

  const snippet = await fetchQuery(api.snippets.getSnippetById, {
    snippetId: snippetId as Id<"snippets">,
  });

  const snippetEmbedding = await fetchQuery(
    api.snippet_embeddings.getSnippetEmbeddingBySnippetId,
    { snippetId: snippet?._id }
  );

  return {
    title: snippet ? `Snippet about ${snippet.title}` : "No snippet found!",
    description: snippetEmbedding?.abstract ?? "No snippet found!",
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

  const revalidatePageAfterAction = async () => {
    "use server"
    revalidatePath(`/snippet/${snippetId}`);
  }
  
  return (
    <div className="flex flex-col w-full xl:w-[90%] mx-auto">
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
        revalidatePageAfterAction={revalidatePageAfterAction}
      />
    </div>
  );
};

export default Snippet;
