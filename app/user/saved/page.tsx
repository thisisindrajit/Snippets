import CSavedSnippetsHolder from "@/components/common/CSavedSnippetsHolder";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Saved = async () => {
  const user = await currentUser();

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  return <CSavedSnippetsHolder />;
};

export default Saved;
