"use client";

import { FC, useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Card, CardContent } from "../ui/card";
import Markdown from "react-markdown";
import { convertToPrettyDateFormatInLocalTimezone } from "@/utilities/commonUtilities";
import CReferenceHolder from "@/components/holders/CReferenceHolder";
import { CircleArrowRight} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ICSnippetProps {
  snippetId: string;
  showLinkIcon?: boolean;
  generatedByAi?: boolean;
  title: string;
  requestorName: string | null;
  requestedOn: Date | null;
  savedOn?: Date | null;
  whatOrWho: string[];
  when: string[];
  where: string[];
  why: string[];
  how: string[];
  amazingFacts: string[];
  references: { link: string; title: string; description: string }[];
  showLikeSaveAndNotes?: boolean;
  isLikedByUser?: boolean;
  isSavedByUser?: boolean;
  note?: string;
  className?: string;
  capitalizeTitle?: boolean;
}

const CSnippet: FC<ICSnippetProps> = ({
  snippetId,
  showLinkIcon = false,
  generatedByAi = false,
  title,
  requestorName,
  requestedOn,
  savedOn,
  whatOrWho,
  when,
  where,
  why,
  how,
  amazingFacts,
  references,
  className,
  capitalizeTitle = true,
}) => {
  const categoryArray = [whatOrWho, when, where, why, how];

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(5);

  const getCurrentSlideText = (current: number) => {
    switch (current) {
      case 0:
        return "🧑 What/Who";
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

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div
      className={cn(
        "border border-neutral-300 shadow-lg text-accent-foreground min-h-[24rem] h-fit rounded-lg flex flex-col p-3 sm:p-4 gap-6 lg:gap-8",
        className
      )}
    >
      {/* Title, type and request details */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center justify-center w-fit">
          <div
            className={`text-lg/relaxed sm:text-xl/relaxed font-medium underline decoration-dotted underline-offset-8 ${
              capitalizeTitle ? "capitalize" : "normal-case"
            }`}
          >
            {title}
          </div>
          {showLinkIcon && (
            <Link href={`/user/snippet/${snippetId}`}>
              <CircleArrowRight className="h-5 w-5 stroke-primary" />
            </Link>
          )}
        </div>
        <div className="flex flex-col gap-1">
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
            5W1H {generatedByAi && `(AI generated)`}
          </div>
          {references?.length > 0 && (
            <CReferenceHolder references={references} />
          )}
        </div>
      </div>
      {/* 5W1H carousel */}
      <div className="w-full md:w-4/5 m-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="bg-background text-foreground border border-foreground p-2 rounded-md w-fit text-sm sm:text-base">
            {getCurrentSlideText(current)}
          </div>
        </div>
        <Carousel setApi={setApi} opts={{ loop: true }}>
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
        <div className="bg-accent/35 p-3 rounded-lg flex flex-col gap-4">
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
    </div>
  );
};

export default CSnippet;