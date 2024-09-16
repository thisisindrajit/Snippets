import CSnippetsHolder from "@/components/holders/CSnippetsHolder";
import { APP_NAME } from "@/constants/common";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export function metadata(): Metadata {
  return {
    title: `Dashboard - ${APP_NAME}`,
    description: `The dashboard contains new and trending snippets.`,
  }
}

const Dashboard = async () => {
  const user = await currentUser();

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
  }

  return <CSnippetsHolder />;
};

export default Dashboard;
