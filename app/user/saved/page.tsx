import CSavedSnippetsHolder from "@/components/CSavedSnippetsHolder";
import { APP_NAME } from "@/constants/common";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export function metadata(): Metadata {
  return {
    title: `Saved Snippets - ${APP_NAME}`, 
    description: `The saved snippets page contains the list of all snippets saved by the user.`,
  }
}

const Saved = async () => {
  const user = await currentUser();

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  return <CSavedSnippetsHolder />;
};

export default Saved;
