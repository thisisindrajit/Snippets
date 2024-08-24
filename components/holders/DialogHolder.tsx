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
  children: ReactNode;
}> = ({
  triggerAsChild = true,
  dialogTrigger,
  className,
  title,
  children: dialogContent,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild={triggerAsChild}>{dialogTrigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "flex flex-col gap-4 w-[90%] p-4 rounded-md dark:border-neutral-700 pt-2 pb-4",
          className
        )}
      >
        {/* Dialog title and close button holder */}
        <DialogHeader className="flex flex-row items-center justify-between gap-8 w-full">
          <DialogTitle title={title} className="text-base truncate mt-1.5">
            {title}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="destructive" size="icon" className="h-6 w-6">
              <X className="h-4 w-4 stroke-white" />
            </Button>
          </DialogClose>
        </DialogHeader>
        {/* Dialog content */}
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
};

export default DialogHolder;
