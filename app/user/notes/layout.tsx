import TopBar from "@/components/common/TopBar";
import CTopicSearchBar from "@/components/common/CTopicSearchBar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SideBar from "@/components/common/Sidebar";
import Tabs from "@/components/common/Tabs";
import { Separator } from "@/components/ui/separator";

const NotesLayout = async ({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) => {
  const user = await currentUser();

  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
  }

  return (
    <div className="flex flex-col gap-12 p-4 lg:p-6">
      <TopBar />
      <CTopicSearchBar />
      {/* Tabs (will be shown in smaller screens) */}
      <Tabs active={3} />
      <div className="flex gap-4 w-full 2xl:w-[90%] mx-auto">
        {/* Sidebar (will be shown in larger screens) */}
        <SideBar active={3} />
        {/* Main content */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-xl/loose sm:text-2xl/loose text-primary">
              <span className="font-medium italic">{`${user.firstName}'s`}</span>{" "}
              notes 📝
            </div>
            <Separator className="block xl:hidden" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default NotesLayout;
