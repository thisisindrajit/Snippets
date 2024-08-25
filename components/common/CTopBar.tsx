"use client";

import { FC, useEffect } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trophy } from "lucide-react";

const CTopBar: FC = () => {
  const { user } = useUser();

  const handleScroll = () => {
    const currentScrollPos = window.scrollY;
    const topBarElement = document.getElementById("top-bar");

    // This condition is to add the "top-bar-on-scroll" class to the top bar if the current scroll position is not at the top
    if (currentScrollPos > 0) {
      topBarElement?.classList.add("top-bar-on-scroll");
    } else {
      topBarElement?.classList.remove("top-bar-on-scroll");
    }
  };

  useEffect(() => {
    const initialScrollPos = window.scrollY;
    const topBarElement = document.getElementById("top-bar");

    // This condition is to add the "top-bar-on-scroll" class to the top bar if the initial scroll position is not at the top
    if (initialScrollPos > 0) {
      topBarElement?.classList.add("top-bar-on-scroll");
    }

    window.addEventListener("scroll", handleScroll);

    // IMPORTANT: These classes are added at the end of useEffect to make sure that in case of slow loading, the top bar styling is not broken before the full JS is loaded
    topBarElement?.classList.add("sticky", "top-2");

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      id="top-bar"
      className="flex items-center justify-between transition-all duration-100 w-full z-50"
    >
      {/* Logo */}
      <Link
        href={user ? `/user/dashboard` : `/`}
        className="flex items-center justify-center space-x-3 h-8"
      >
        <Image src="/logo.svg" alt="Snippets Logo" width={20} height={20} />
        <Separator orientation="vertical" className="h-6 bg-black" />
        <div className="underline-offset-2 text-base sm:text-lg">Snippets</div>
      </Link>
      {/* User menu button (if signed in) or SignIn button (if signed out) */}
      <Authenticated>
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex gap-1.5 items-center justify-center text-sm text-amber-500 bg-background py-1 px-2 rounded-lg border border-amber-500 cursor-pointer h-8">
            <Trophy className="h-4 w-4" />
            Soon!
          </div>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "size-8",
              },
            }}
          />
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center gap-2">
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
      </Unauthenticated>
    </div>
  );
};

export default CTopBar;
