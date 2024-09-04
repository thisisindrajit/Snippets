"use client";

import HorizontalSeparatorWithText from "@/components/common/HorizontalSeparatorWithText";
import { Input } from "@/components/ui/input";
import {
  EmailShareButton,
  WhatsappShareButton,
  WhatsappIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  EmailIcon,
  RedditShareButton,
  RedditIcon,
} from "next-share";
import { FC } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";

const CShareDialogContentHolder: FC<{
  title: string;
  link: string;
}> = ({ title, link }) => {
  const iconCommonClassName = "h-9 w-9 rounded-md";
  const fullText = `Check out this snippet titled "${title}"`;
  const separator = " - ";

  const copyLinkToClipboard = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied to clipboard! 📋");
      })
      .catch(() => {
        toast.error("Failed to copy link to clipboard 😢");
      });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Helper text */}
      <div className="text-sm/loose text-justify">
        Share this snippet titled{" "}
        <span className="text-primary font-medium">{`"${title}"`}</span> by
        copying the link below.
      </div>
      {/* Link and copy to clipboard button */}
      <div className="flex gap-2">
        <Input className="h-9 select-none" defaultValue={link} readOnly />
        <Button
          size="icon"
          className="h-9 aspect-square"
          onClick={copyLinkToClipboard}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <HorizontalSeparatorWithText text="or share to" className="text-sm" />
      {/* Social icons */}
      <div className="flex flex-wrap justify-center self-center gap-2 w-fit">
        <EmailShareButton
          url={link}
          subject={`Check out this snippet :)`}
          body={fullText}
          separator={separator}
          blankTarget
        >
          <EmailIcon className={iconCommonClassName} />
        </EmailShareButton>
        <WhatsappShareButton
          url={link}
          title={fullText}
          separator={separator}
          blankTarget
        >
          <WhatsappIcon className={iconCommonClassName} />
        </WhatsappShareButton>
        <TwitterShareButton url={link} title={fullText} blankTarget>
          <TwitterIcon className={iconCommonClassName} />
        </TwitterShareButton>
        <LinkedinShareButton url={link} blankTarget>
          <LinkedinIcon className={iconCommonClassName} />
        </LinkedinShareButton>
        <RedditShareButton url={link} title={fullText} blankTarget>
          <RedditIcon className={iconCommonClassName} />
        </RedditShareButton>
      </div>
    </div>
  );
};

export default CShareDialogContentHolder;
