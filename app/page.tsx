import TopBar from "@/components/TopBar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import CSnippet from "@/components/CSnippet";
import { SNIPPETS_SNIPPET_DETAILS } from "@/constants/common";

const Home = async () => {
  const { userId }: { userId: string | null } = auth();

  if (userId) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  return (
    <div className="flex flex-col items-center justify-between gap-12 min-h-screen p-4 lg:p-6">
      <TopBar />
      <div className="flex flex-col gap-6 w-full">
        {/* Landing page grid */}
        <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-4">
          {/* First grid */}
          <div className="flex flex-col gap-2 lg:gap-4 w-full">
            {/* Snippets motto */}
            <div className="bg-primary/25 text-2xl/relaxed sm:text-3xl/relaxed xl:text-4xl/relaxed text-center p-6 sm:p-12 rounded-lg">
              Where{" "}
              <span className="bg-primary/50 text-primary-foreground font-medium">
                every scroll
              </span>{" "}
              inspires{" "}
              <span className="text-primary font-medium">learning.</span>
            </div>
            {/* Snippets definition */}
            <div className="flex flex-col gap-4 bg-secondary/25 p-6 sm:p-12 rounded-lg h-full justify-center">
              <span className="text-secondary text-2xl sm:text-3xl">
                Snippets
              </span>
              <Separator className="bg-secondary" />
              <div className="text-base/loose sm:text-lg/loose text-justify">
                Snippets is an{" "}
                <span className="font-medium italic">
                  AI powered ed-tech social media platform
                </span>{" "}
                that aims to enhance your knowledge, one{" "}
                <span className="text-secondary underline underline-offset-2 font-medium">
                  snippet
                </span>{" "}
                at a time.
              </div>
            </div>
          </div>
          {/* Second grid (only snippet) */}
          <div className="w-full lg:w-[50%] 2xl:w-full">
            <CSnippet
              snippetId={SNIPPETS_SNIPPET_DETAILS.id}
              title={SNIPPETS_SNIPPET_DETAILS.title}
              requestedOn={null}
              requestorName={null}
              what={SNIPPETS_SNIPPET_DETAILS.what}
              why={SNIPPETS_SNIPPET_DETAILS.why}
              when={SNIPPETS_SNIPPET_DETAILS.when}
              where={SNIPPETS_SNIPPET_DETAILS.where}
              how={SNIPPETS_SNIPPET_DETAILS.how}
              amazingFacts={SNIPPETS_SNIPPET_DETAILS.amazingFacts}
              references={SNIPPETS_SNIPPET_DETAILS.references}
              tags={SNIPPETS_SNIPPET_DETAILS.tags}
              className="h-full lg:pb-8"
              showLikeSaveAndNotes={false}
              showLinkIcon={false}
            />
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="text-sm sm:text-base">
        Created with ❤️ by{" "}
        <a
          className="text-primary underline underline-offset-2 font-medium"
          href="https://thisisindrajit.github.io/portfolio"
          target="_blank"
          rel="noopener noreferrer"
        >
          Indrajit
        </a>
      </div>
    </div>
  );
};

export default Home;
