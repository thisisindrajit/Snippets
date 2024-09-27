"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, RotateCw } from "lucide-react";
import { FC, ChangeEvent, FormEvent, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { retryFunction } from "@/utilities/commonUtilities";
import { fetchMutation } from "convex/nextjs";

const CTopicSearchBar: FC = () => {
  const { userId } = useAuth();
  const userByExternalId = useQuery(api.users.getUserByExternalId, {
    externalId: userId ?? undefined,
  });
  const generateSnippetAction = useAction(
    api.snippet_generation_action.generateSnippet
  );

  const [generatingSnippet, setGeneratingSnippet] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [width, setWidth] = useState(18);

  const snippetGenerationErrorHandler = async () => {
    userByExternalId &&
      (await fetchMutation(api.notifications.createNotification, {
        notification: searchQuery,
        notification_creator: undefined,
        notification_receiver: userByExternalId._id,
        type: "error", // fetching notification type for error
      }));

    toast.error(
      <div className="text-sm/loose">
        Error while generating snippet for search query{" "}
        <span className="font-semibold italic">{searchQuery}</span>! Please try
        again.
      </div>,
      {
        duration: Infinity,
      }
    );
  };

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setWidth(e.target.value.length > 18 ? e.target.value.length : 18);
  };

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault();

    const searchInputEl = document.getElementById("search-input");

    setGeneratingSnippet(true);
    searchInputEl?.blur();

    const formattedSearchQuery = searchQuery.trim();

    if (formattedSearchQuery === "") {
      setSearchQuery("");
      setGeneratingSnippet(false);

      return alert("Please enter a search query!");
    }

    setSearchQuery(formattedSearchQuery);
    setWidth(formattedSearchQuery.length);

    toast.success(
      <div className="text-sm/loose text-justify">
        Hurray 🥳, your request for search query{" "}
        <span className="font-semibold italic">{searchQuery}</span> has been
        queued! You will receive a notification when the AI generated snippet is
        available. Meanwhile you can check out new and trending snippets 😎.
      </div>,
      {
        duration: 10000,
      }
    );

    try {
      const isSuccess = await retryFunction(() =>
        generateSnippetAction({
          searchQuery: searchQuery,
          externalUserId: userId ?? undefined,
        })
      );

      if (!isSuccess) {
        await snippetGenerationErrorHandler();
      }
    } catch (error) {
      console.error(
        `Some error occurred while generating snippet. ${error instanceof Error && error.message}`
      );
      await snippetGenerationErrorHandler();
    }

    setSearchQuery("");
    setWidth(18);
    setGeneratingSnippet(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 text-xl md:text-2xl m-auto my-6">
      <span
        className={`${generatingSnippet && "animate-pulse"} min-w-fit no-underline md:underline decoration-dotted underline-offset-[14px]`}
      >
        {generatingSnippet
          ? "Generating snippet now for "
          : "Today I want to know about "}
      </span>
      <form onSubmit={submitHandler} className="flex gap-2">
        <Input
          id="search-input"
          placeholder="type in any topic..."
          className={`text-xl md:text-2xl text-center sm:text-left px-0 pb-2 md:pb-4 rounded-none outline-none border-x-0 border-t-0 border-b-2 text-tertiary focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus-visible:border-tertiary focus-visible:placeholder:opacity-0 sm:focus-visible:placeholder:opacity-100 duration-200 ease-in-out max-w-[72vw] sm:max-w-[42vw] md:max-w-[48vw] italic ${generatingSnippet ? "border-tertiary" : "border-gray-300"}`}
          style={{
            width: width + "ch",
          }}
          maxLength={100}
          value={searchQuery}
          onChange={(e) => changeHandler(e)}
          autoComplete="off"
          readOnly={generatingSnippet}
        />
        {generatingSnippet ? (
          <div className="h-10 w-10 rounded-full border-[1.5px] border-tertiary bg-tertiary/5 text-tertiary flex items-center justify-center">
            <RotateCw className="animate-spin h-5 w-5" />
          </div>
        ) : (
          <Button
            size="icon"
            type="submit"
            className="rounded-full bg-tertiary text-tertiary-foreground hover:bg-tertiary/90"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}
      </form>
    </div>
  );
};

export default CTopicSearchBar;
