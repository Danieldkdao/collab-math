"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

export const HeroImage = () => {
  const { resolvedTheme } = useTheme();

  const imageSrc =
    resolvedTheme === "dark" ? "/hero-image-dark.png" : "/hero-image-light.png";

  return (
    <div className="w-full h-100 md:h-135 lg:h-160 rounded-md border relative overflow-hidden">
      <Image
        src={imageSrc}
        alt="Hero image"
        fill
        className="object-cover h-full w-full"
        loading="eager"
      />
    </div>
  );
};
