import { cn } from "@repo/ui/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

interface User {
  username: string;
  profile: {
    firstname: string;
    lastname: string;
    avatar: string;
  };
}

interface UserDisplayProps {
  user?: User;
  className?: string;
  size?: string;
  avatar?: boolean;
  username?: boolean;
  name?: boolean;
  avatarClassName?: string;
  nameClassName?: string;
  usernameClassName?: string;
}

const UserDisplay = ({
  user,
  className,
  size = "md",
  avatar = true,
  username = true,
  name = true,
  avatarClassName = "",
  nameClassName = "",
  usernameClassName = "",
}: UserDisplayProps) => {
  if (!user?.username) {
    return <></>;
  }

  switch (size) {
    case "sm":
      className = cn("text-sm gap-2", className);
      avatarClassName = cn("relative w-5 h-5", avatarClassName);
      nameClassName = cn("text-sm", nameClassName);
      break;
    case "md":
      className = cn("text-base", className);
      break;
    case "lg":
      className = cn("text-lg", className);
      avatarClassName = cn("w-12 h-12", avatarClassName);
      break;
    default:
      className = cn("text-base", className);
      break;
  }

  return (
    <div className={cn("flex items-center gap-3 relative", className)}>
      <div className="relative">
        {avatar && (
          <Avatar className={avatarClassName}>
            <AvatarImage
              src={
                user?.profile?.avatar ||
                `https://api.dicebear.com/8.x/thumbs/svg?seed=${user?.username}`
              }
              alt={user?.username}
            />
            <AvatarFallback>
              {user?.profile?.firstname?.[0] && user?.profile?.lastname?.[0]
                ? user?.profile?.firstname?.[0] + user?.profile?.lastname?.[0]
                : user?.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="absolute -end-1 -top-1">
          <span className="sr-only">Verified</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              className="fill-background"
              d="M3.046 8.277A4.402 4.402 0 0 1 8.303 3.03a4.4 4.4 0 0 1 7.411 0 4.397 4.397 0 0 1 5.19 3.068c.207.713.23 1.466.067 2.19a4.4 4.4 0 0 1 0 7.415 4.403 4.403 0 0 1-3.06 5.187 4.398 4.398 0 0 1-2.186.072 4.398 4.398 0 0 1-7.422 0 4.398 4.398 0 0 1-5.257-5.248 4.4 4.4 0 0 1 0-7.437Z"
            />
            <path
              className="fill-primary"
              d="M4.674 8.954a3.602 3.602 0 0 1 4.301-4.293 3.6 3.6 0 0 1 6.064 0 3.598 3.598 0 0 1 4.3 4.302 3.6 3.6 0 0 1 0 6.067 3.6 3.6 0 0 1-4.29 4.302 3.6 3.6 0 0 1-6.074 0 3.598 3.598 0 0 1-4.3-4.293 3.6 3.6 0 0 1 0-6.085Z"
            />
            <path
              className="fill-background"
              d="M15.707 9.293a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 1 1 1.414-1.414L11 12.586l3.293-3.293a1 1 0 0 1 1.414 0Z"
            />
          </svg>
        </span>
      </div>
      <div className="my-auto text-sm truncate flex-0">
        {name && (
          <div className={cn("font-medium", nameClassName)}>
            {user?.profile?.firstname?.[0] && user?.profile?.lastname?.[0]
              ? `${user?.profile?.firstname} ${user?.profile?.lastname}`
              : user?.username}
          </div>
        )}
        {username && (
          <div
            className={cn("text-xs text-muted-foreground", usernameClassName)}
          >
            {user?.username}
          </div>
        )}
      </div>
    </div>
  );
};

export { UserDisplay };
