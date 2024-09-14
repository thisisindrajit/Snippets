import CNotesHolder from "@/components/CNotesHolder";
import { APP_NAME } from "@/constants/common";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export function metadata(): Metadata {
  return {
    title: `Notes - ${APP_NAME}`,
    description: `The notes page contains the list of all user notes.`,
  }
}

const Notes = async () => {
  const user = await currentUser();

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`);
  }

  return <CNotesHolder />
};

export default Notes;
