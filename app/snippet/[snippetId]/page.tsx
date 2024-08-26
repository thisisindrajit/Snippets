import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FC } from "react";

const Snippet: FC<{
  params: { snippetId: string };
}> = async ({ params }) => {
  const user = await currentUser();
  const { snippetId } = params;

  if (!snippetId || !user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  return (
    <div className="flex flex-col gap-4 w-full 2xl:w-[90%] mx-auto">
      <Link href={`/user/dashboard`}>
        <Button
          variant="outline"
          className="flex gap-2 items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to trending snippets
        </Button>
        <div>Snippet goes here...</div>
      </Link>
      
    </div>
  );
};

export default Snippet;
