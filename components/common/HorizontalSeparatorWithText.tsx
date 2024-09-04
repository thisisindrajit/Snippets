import { cn } from "@/lib/utils";
import { FC } from "react";

const HorizontalSeparatorWithText: FC<{
  className?: string;
  text: string;
}> = ({ className, text }) => {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex-grow border-t border-primary"></div>
      <span className="flex-shrink mx-4 text-foreground">{text}</span>
      <div className="flex-grow border-t border-primary"></div>
    </div>
  );
};

export default HorizontalSeparatorWithText;
