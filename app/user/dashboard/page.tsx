import CSnippetsHolder from "@/components/common/CSnippetsHolder";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const user = await currentUser();

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
  }

  return <CSnippetsHolder />;
};

export default Dashboard;
