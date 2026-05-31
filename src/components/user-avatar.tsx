import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type UserAvatarProps = {
  name: string;
  image?: string | undefined | null;
  className?: string;
  textClassName?: string;
};

export const UserAvatar = ({
  name,
  image,
  className,
  textClassName,
}: UserAvatarProps) => {
  return (
    <Avatar className={className}>
      <AvatarImage src={image ?? undefined} alt={`${name}'s profile image`} />
      <AvatarFallback className={textClassName}>
        {name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0].toUpperCase())
          .join("")}
      </AvatarFallback>
    </Avatar>
  );
};
