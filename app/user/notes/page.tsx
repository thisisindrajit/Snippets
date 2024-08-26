import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Notes = async () => {
  const user = await currentUser();

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  return <div>User notes go here...</div>
};

export default Notes;
