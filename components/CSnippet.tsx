"use client";

import { FC, Fragment, useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Card, CardContent } from "./ui/card";
import Markdown from "react-markdown";
import { convertToPrettyDateFormatInLocalTimezone } from "@/utilities/commonUtilities";
import CReferenceHolder from "@/components/holders/CReferenceHolder";
import { ArrowRight, Bookmark, Heart, Share } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import DialogHolder from "./holders/DialogHolder";
import CShareDialogContentHolder from "./holders/CShareDialogHolder";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import NotesDialogHolder from "./holders/NotesDialogHolder";
import CSimilarSnippetsHolder from "./holders/CSimilarSnippetsHolder";

const CSnippet: FC<{
  snippetId: Id<"snippets">;
  title: string;
  requestedBy?: Id<"users">;
  requestorName: string | null;
  requestedOn: Date | null;
  savedOn?: Date | null;
  what: string[];
  when: string[];
  where: string[];
  why: string[];
  how: string[];
  amazingFacts: string[];
  references: { link: string; title: string; description: string }[];
  tags: string[];
  likesCount?: number;
  className?: string;
  capitalizeTitle?: boolean;
  showLinkIcon?: boolean;
  showShareButton?: boolean;
  showLikeSaveAndNotes?: boolean;
  revalidatePageAfterAction?: () => void;
}> = ({
  snippetId,
  title,
  requestorName,
  requestedOn,
  savedOn,
  what,
  when,
  where,
  why,
  how,
  amazingFacts,
  references,
  tags,
  likesCount,
  className,
  capitalizeTitle = true,
  showLinkIcon = true,
  showShareButton = false,
  showLikeSaveAndNotes = true,
  revalidatePageAfterAction,
}) => {
  const { userId } = useAuth();
  const categoryArray = [what, when, where, why, how];

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(5);

  const getCurrentSlideText = (current: number) => {
    switch (current) {
      case 0:
        return "❓ What/Who";
      case 1:
        return "🕒 When";
      case 2:
        return "📍 Where";
      case 3:
        return "🤔 Why";
      case 4:
        return "🛠️ How";
      default:
        return `Slide ${current} of ${count}`;
    }
  };

  let handleLike = () => {};
  let handleSave = () => {};
  let isLikedByUser: boolean = false;
  let isSavedByUser: boolean = false;

  const userByExternalId = useQuery(api.users.getUserByExternalId, {
    externalId: userId ?? undefined,
  });

  const likeDetails = useQuery(api.likes.getLikeDetails, {
    snippetId: userId ? snippetId : undefined,
    likedBy: userByExternalId?._id,
  });

  isLikedByUser = !!likeDetails;

  const likeMutation = useMutation(
    api.likes.likeOrUnlikeSnippet
  ).withOptimisticUpdate((localStore, args) => {
    const { snippetId, isLiked } = args;
    const currentSnippet = localStore.getQuery(api.snippets.getSnippetById, {
      snippetId,
    });

    if (currentSnippet) {
      localStore.setQuery(
        api.snippets.getSnippetById,
        { snippetId },
        {
          ...currentSnippet,
          likes_count: isLiked
            ? currentSnippet.likes_count + 1
            : currentSnippet.likes_count - 1,
        }
      );
    }

    localStore.setQuery(
      api.likes.getLikeDetails,
      {
        snippetId: snippetId,
        likedBy: userByExternalId?._id,
      },
      isLiked
        ? {
            _id: crypto.randomUUID() as Id<"likes">,
            _creationTime: Date.now(),
            snippet_id: snippetId,
            liked_by: userByExternalId?._id as Id<"users">,
          }
        : null
    );
  });

  handleLike = async () => {
    await likeMutation({
      snippetId: snippetId,
      isLiked: !isLikedByUser,
      modifiedBy: userByExternalId?._id,
    });

    revalidatePageAfterAction && revalidatePageAfterAction();
  };

  const saveDetails = useQuery(api.saves.getSaveDetails, {
    snippetId: userId ? snippetId : undefined,
    savedBy: userByExternalId?._id,
  });

  isSavedByUser = !!saveDetails;

  const saveMutation = useMutation(
    api.saves.saveOrUnsaveSnippet
  ).withOptimisticUpdate((localStore, args) => {
    const { isSaved } = args;

    localStore.setQuery(
      api.saves.getSaveDetails,
      {
        snippetId: snippetId,
        savedBy: userByExternalId?._id,
      },
      isSaved
        ? {
            _id: crypto.randomUUID() as Id<"saves">,
            _creationTime: Date.now(),
            snippet_id: snippetId,
            saved_by: userByExternalId?._id as Id<"users">,
          }
        : null
    );
  });

  handleSave = async () => {
    await saveMutation({
      snippetId: snippetId,
      isSaved: !isSavedByUser,
      modifiedBy: userByExternalId?._id,
    });
  };

  const noteDetails = useQuery(api.notes.getNoteDetails, {
    snippetId: userId ? snippetId : undefined,
    notedBy: userByExternalId?._id,
  });

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    setCount(carouselApi.scrollSnapList().length);
    setCurrent(carouselApi.selectedScrollSnap());

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  return (
    <div
      className={cn(
        "border border-primary shadow-xl text-accent-foreground min-h-[24rem] h-fit rounded-lg flex flex-col p-3 sm:p-4 gap-6 lg:gap-8",
        className
      )}
    >
      {/* Title, type, request details and tags */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-6">
          <div
            className={`text-lg/loose sm:text-xl/relaxed font-medium underline decoration-dotted underline-offset-8 line-clamp-2 ${
              capitalizeTitle ? "capitalize" : "normal-case"
            }`}
            title={title}
          >
            {title}
          </div>
          {userId && (
            <CSimilarSnippetsHolder
              snippetId={snippetId}
              snippetTitle={title}
            />
          )}
        </div>
        <div className="flex flex-col">
          {savedOn && (
            <div className="text-xs/loose sm:text-sm/loose text-secondary">
              Saved{" "}
              <span className="font-semibold uppercase">
                {convertToPrettyDateFormatInLocalTimezone(savedOn)}
              </span>
            </div>
          )}
          {requestorName && requestedOn && (
            <div className="text-xs/loose sm:text-sm/loose text-neutral-500">
              Requested{" "}
              <span className="font-semibold uppercase">
                {convertToPrettyDateFormatInLocalTimezone(requestedOn)}
              </span>{" "}
              by <span className="font-semibold italic">{requestorName}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center justify-center w-fit font-medium">
          <div className="text-xs bg-accent text-accent-foreground py-1 px-2 w-fit rounded-lg">
            5W1H (AI generated)
          </div>
          {references?.length > 0 && (
            <CReferenceHolder references={references} />
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags &&
            tags.length > 0 &&
            tags.slice(0, 5).map((tag, index) => {
              return (
                <div
                  key={index}
                  className="text-xs bg-primary/5 border border-primary font-medium text-primary py-1 px-2 w-fit rounded-lg"
                >
                  {tag}
                </div>
              );
            })}
        </div>
      </div>
      {/* 5W1H carousel */}
      <div className="w-full md:w-4/5 m-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="bg-background text-foreground border border-foreground p-2 rounded-md w-fit text-sm sm:text-base">
            {getCurrentSlideText(current)}
          </div>
          {userId && showLikeSaveAndNotes && (
            <NotesDialogHolder
              snippetId={snippetId}
              snippetTitle={title}
              note={noteDetails?.note}
            />
          )}
        </div>
        <Carousel setApi={setCarouselApi} opts={{ loop: true }}>
          <CarouselContent>
            {categoryArray.map((content, index) => (
              <CarouselItem key={index}>
                <Card className="flex flex-col w-full p-3 select-none">
                  <CardContent className="px-4">
                    <ul className="flex flex-col gap-4 list-disc list-outside">
                      {content?.length > 0 ? (
                        content.map((sentence, index) => {
                          return (
                            <li
                              key={index}
                              className="leading-loose text-justify"
                            >
                              <Markdown>{sentence}</Markdown>
                            </li>
                          );
                        })
                      ) : (
                        <li>No data available 😭</li>
                      )}
                    </ul>
                  </CardContent>
                  <span className="text-sm px-2 py-1 bg-neutral-50 border border-neutral-300 rounded-lg w-fit self-end">
                    👆🏻 Swipe for knowing{" "}
                    {getCurrentSlideText((current + 1) % count)}
                  </span>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
      {/* Amazing facts */}
      {amazingFacts?.length > 0 && (
        <div className="bg-accent/50 p-3 rounded-lg flex flex-col gap-4">
          <span className="bg-background text-foreground border border-foreground p-2 rounded-md w-fit">
            {`🤯 Amazing facts`}
          </span>
          <ul className="flex flex-col gap-4 px-4 list-disc list-outside">
            {amazingFacts.map((fact, index) => (
              <li key={index} className="leading-loose text-justify">
                <Markdown>{fact}</Markdown>
              </li>
            ))}
          </ul>
        </div>
      )}
      {userId ? (
        showLikeSaveAndNotes && (
          <div className="flex items-center w-full gap-2 h-10 select-none">
            <div
              className="bg-red-50 flex items-center justify-center gap-1.5 text-sm w-fit text-red-600 p-2.5 sm:px-4 sm:py-3 h-full rounded-md cursor-pointer border border-red-600"
              onClick={handleLike}
            >
              {isLikedByUser ? (
                <Heart className="h-4 w-4 fill-red-600" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
              {likesCount}
            </div>
            <div
              className="bg-orange-50 flex items-center justify-center gap-1.5 text-sm w-fit text-orange-600 p-2.5 sm:px-4 sm:py-3 h-full rounded-md cursor-pointer border border-orange-600"
              onClick={handleSave}
            >
              {isSavedByUser ? (
                <Fragment>
                  <Bookmark className="h-4 w-4 fill-orange-600" />
                  <span>Saved</span>
                </Fragment>
              ) : (
                <Fragment>
                  <Bookmark className="h-4 w-4" />
                  <span>Save</span>
                </Fragment>
              )}
            </div>
            <DialogHolder
              dialogTrigger={
                <div className="bg-emerald-50 text-sm w-fit text-emerald-600 rounded-md cursor-pointer border border-emerald-600 p-2.5 sm:p-3 h-full aspect-square flex items-center justify-center">
                  <Share className="h-4 w-4" />
                </div>
              }
              title="Share snippet"
            >
              <CShareDialogContentHolder
                title={title}
                link={`${process.env.NEXT_PUBLIC_BASE_URL}/snippet/${snippetId}`}
              />
            </DialogHolder>
            {showLinkIcon && (
              <Link
                href={`/snippet/${snippetId}`}
                className="bg-primary/10 flex items-center justify-center gap-1.5 text-sm h-full w-fit mx-auto mr-0 text-primary p-2 sm:px-3 sm:py-2 rounded-md border border-primary aspect-square xs:aspect-auto"
                target="_blank"
              >
                <span className="hidden xs:block">View</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )
      ) : (showShareButton && <DialogHolder
          dialogTrigger={
            <div className="bg-emerald-50 text-sm w-fit text-emerald-600 rounded-md cursor-pointer border border-emerald-600 p-2.5 h-full flex items-center justify-center gap-2 mx-auto mr-0">
              <Share className="h-4 w-4" />
              <span>Share snippet</span>
            </div>
          }
          title="Share snippet"
        >
          <CShareDialogContentHolder
            title={title}
            link={`${process.env.NEXT_PUBLIC_BASE_URL}/snippet/${snippetId}`}
          />
        </DialogHolder>
      )}
    </div>
  );
};

export default CSnippet;
