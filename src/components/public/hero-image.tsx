import Image from "next/image";

export const HeroImage = () => {
  return (
    <div className="relative aspect-3420/1794 w-full overflow-hidden rounded-md border">
      <Image
        src="/hero-image-light.png"
        alt="Hero image"
        fill
        className="object-cover dark:hidden"
        loading="eager"
        sizes="(min-width: 1280px) 1232px, calc(100vw - 3rem)"
      />
      <Image
        src="/hero-image-dark.png"
        alt="Hero image"
        fill
        className="hidden object-cover dark:block"
        loading="eager"
        sizes="(min-width: 1280px) 1232px, calc(100vw - 3rem)"
      />
    </div>
  );
};
