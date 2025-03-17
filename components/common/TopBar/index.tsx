import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FC } from "react";
import { currentUser } from "@clerk/nextjs/server";
import CTopBarHolder from "./CTopBarHolder";
import Link from "next/link";
import CNotificationHolder from "@/components/holders/CNotificationHolder";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

const TopBar: FC = async () => {
  const user = await currentUser();

  return (
    <CTopBarHolder>
      {/* Logo */}
      <Link
        href={user ? `/user/dashboard` : `/`}
        className="flex items-center justify-center space-x-3 h-8"
      >
        <Image src="/logo.svg" alt="Snippets Logo" width={20} height={20} />
        <Separator
          orientation="vertical"
          className="h-6 bg-black hidden xs:block"
        />
        <div className="underline-offset-2 text-base sm:text-lg hidden xs:block">
          Snippets
        </div>
      </Link>
      {/* User menu button (if signed in) or SignIn button (if signed out) */}
      <SignedIn>
        <div className="flex items-center justify-center gap-2.5">
          <Link
            href="https://github.com/thisisindrajit/Snippets"
            target="_blank"
          >
            <Button
              size="sm"
              variant="outline"
              className="flex rounded-lg gap-1.5 border-foreground hover:bg-foreground hover:text-background h-8"
            >
              <GitHubLogoIcon className="h-4 w-4" />
              Repo
            </Button>
          </Link>
          {/* <div className="flex gap-1.5 items-center justify-center text-sm text-amber-500 bg-background py-1 px-2 rounded-lg border border-amber-500 h-8">
            <Trophy className="h-4 w-4" />0 XP
          </div> */}
          <CNotificationHolder />
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex items-center justify-center gap-2">
          <Link
            href="https://github.com/thisisindrajit/Snippets"
            target="_blank"
          >
            <Button
              size="sm"
              variant="outline"
              className="flex rounded-lg gap-1.5 border-foreground hover:bg-foreground hover:text-background"
            >
              <GitHubLogoIcon className="h-4 w-4" />
              Repo
            </Button>
          </Link>
          <SignInButton
            forceRedirectUrl="/user/dashboard"
            signUpForceRedirectUrl="/user/dashboard"
            mode="modal"
          >
            <Button size="sm" className="bg-primary rounded-lg text-sm">
              Login
            </Button>
          </SignInButton>
        </div>
      </SignedOut>
    </CTopBarHolder>
  );
};

export default TopBar;
