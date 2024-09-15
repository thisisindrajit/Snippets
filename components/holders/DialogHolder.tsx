import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DialogClose } from "@radix-ui/react-dialog";
import { FC, ReactNode } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

const DialogHolder: FC<{
  triggerAsChild?: boolean;
  dialogTrigger: ReactNode;
  className?: string;
  title: string;
  noChildrenContainer?: boolean;
  children: ReactNode;
}> = ({
  triggerAsChild = true,
  dialogTrigger,
  className,
  title,
  noChildrenContainer = false,
  children: dialogContent,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild={triggerAsChild}>{dialogTrigger}</DialogTrigger>
      <DialogContent
        className={cn(
          `flex flex-col gap-4 w-[90%] rounded-md dark:border-neutral-700 overflow-clip ${noChildrenContainer ? "px-4 pt-2 pb-4" : "p-0"}`,
          className
        )}
      >
        {/* Dialog title and close button holder */}
        <DialogHeader className={`flex flex-row items-center justify-between gap-4 w-full ${!noChildrenContainer && "px-3 pt-2"}`}>
          <DialogTitle title={title} className="text-base truncate mt-1.5">
            {title}
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="destructive"
              size="icon"
              className="h-6 min-w-[1.5rem] w-6"
            >
              <X className="h-4 w-4 stroke-white" />
            </Button>
          </DialogClose>
        </DialogHeader>
        {/* Dialog content */}
        {noChildrenContainer ? (
          dialogContent
        ) : (
          <div className="overflow-auto px-3 pb-4">{dialogContent}</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogHolder;
