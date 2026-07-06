import { cn } from "@/lib/utils";

interface UserAvatarProps {
  className?: string;
  image?: string | null;
  name: string;
}

function getInitials(name: string): string {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "?";
  }

  const [first = "", second = ""] = trimmedName.split(/\s+/u);
  return `${first[0] ?? ""}${second[0] ?? first[1] ?? ""}`.toUpperCase();
}

function UserAvatar({ className, image, name }: UserAvatarProps) {
  if (image) {
    return (
      <img
        alt={`${name} avatar`}
        className={cn(
          "aspect-square rounded-full object-cover ring-1 ring-border",
          className
        )}
        src={image}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-1 ring-border",
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}

export { UserAvatar };
export type { UserAvatarProps };
