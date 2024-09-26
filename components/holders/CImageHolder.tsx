"use client";

import Image from "next/image";
import { FC, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

interface ICImageHolderProps {
  src: string;
  alt: string;
  parentClassName: string;
  [index: string]: any;
}

const CImageHolder: FC<ICImageHolderProps> = ({
  src,
  alt,
  parentClassName,
  ...rest
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  return (
    !imageError && (
      <div className={parentClassName}>
        {!isImageLoaded && (
          <Skeleton
            className={cn(
              "bg-neutral-300",
              parentClassName
            )}
          />
        )}
        <Image
          src={src}
          alt={alt}
          fill={true}
          {...rest}
          onLoad={() => {
            setIsImageLoaded(true);
          }}
          onError={() => {
            setImageError(true);
          }}
        />
      </div>
    )
  );
};

export default CImageHolder;
