"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { FC, ChangeEvent, FormEvent, useState } from "react";
// import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const CSearchBar: FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [width, setWidth] = useState(18);
  // const { userId } = useAuth();

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setWidth(e.target.value.length > 18 ? e.target.value.length : 18);
  };

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();

    document.getElementById("search-input")?.blur();

    const formattedSearchQuery = searchQuery.trim();

    if (formattedSearchQuery === "")
      return alert("Please enter a search query!");

    setSearchQuery("");

    toast.success(
      <div className="text-sm/loose">
        Hurray 🥳, your request for search query{" "}
        <span className="font-semibold">{searchQuery}</span> has been
        queued! You will receive a notification when the AI generated snippet is
        available. Meanwhile you can check out the trending snippets 😎.
      </div>,
      {
        duration: 10000,
      }
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 text-xl md:text-2xl m-auto my-6">
      <span className="min-w-fit no-underline md:underline decoration-dotted underline-offset-[14px]">
        Today I want to know about
      </span>
      <form onSubmit={submitHandler} className="flex gap-2">
        <Input
          id="search-input"
          placeholder="type in any topic..."
          className="text-xl md:text-2xl text-center sm:text-left px-0 pb-2 md:pb-4 rounded-none outline-none border-x-0 border-t-0 border-b-2 border-gray-300 text-tertiary focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus-visible:border-tertiary focus-visible:placeholder:opacity-0 sm:focus-visible:placeholder:opacity-100 duration-200 ease-in-out max-w-[72vw] sm:max-w-[42vw] md:max-w-[48vw] italic"
          style={{ width: width + "ch" }}
          maxLength={255}
          value={searchQuery}
          onChange={(e) => changeHandler(e)}
          autoComplete="off"
        />
        <Button
          size="icon"
          type="submit"
          className="rounded-full bg-tertiary text-tertiary-foreground hover:bg-tertiary/90"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default CSearchBar;
