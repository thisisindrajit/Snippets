"use client";

import Link from "next/link";
import { FC, useEffect, useRef, useState } from "react";

const CTabs: FC<{ active: number }> = ({ active }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const top = ref.current.getBoundingClientRect().top;
        if (top === 72) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`grid grid-cols-3 xl:hidden gap-1 rounded-lg border border-primary/50 text-sm p-1 w-full md:w-3/5 m-auto sticky top-[4.5rem] bg-background shadow-lg ${isSticky ? "z-30" : "z-20"}`}
    >
      <Link
        href="/user/dashboard"
        className={`${active === 1 ? "bg-primary text-primary-foreground" : "text-foreground"} py-2 px-4 rounded-md text-center transition-all`}
      >
        Trending
      </Link>
      <Link
        href="/user/saved"
        className={`${active === 2 ? "bg-primary text-primary-foreground" : "text-foreground"} py-2 px-4 rounded-md text-center transition-all`}
      >
        Saved
      </Link>
      <Link
        href="/user/notes"
        className={`${active === 3 ? "bg-primary text-primary-foreground" : "text-foreground"} py-2 px-4 rounded-md text-center transition-all`}
      >
        Notes
      </Link>
    </div>
  );
};

export default CTabs;
