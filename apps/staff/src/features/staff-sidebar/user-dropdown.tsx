import { authClient } from "@bmhkms/client/auth-client";
import { getRouteApi, useRouter } from "@tanstack/react-router";
import { ChevronDownIcon, LogOutIcon, PaletteIcon } from "lucide-react";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/features/user/avatar";

const AVATAR_FALLBACK_SIZE = "size-10";
const protectedRouteApi = getRouteApi("/_protected");

function UserDropdown() {
  const router = useRouter();
  const { session } = protectedRouteApi.useRouteContext();

  if (!session.data) {
    return null;
  }

  const { email, image, name } = session.data.user;

  async function handleLogout() {
    try {
      await authClient.signOut();
      await router.navigate({ to: "/login" });
    } catch {
      // Future error UI can be added when the dropdown is wired into the app.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        render={
          <Button
            className="h-auto w-full cursor-pointer justify-start gap-3 px-0 py-0 bg-transparent! text-inherit! hover:bg-transparent! hover:text-inherit! dark:hover:bg-transparent! aria-expanded:bg-transparent! aria-expanded:text-inherit! focus-visible:border-transparent! focus-visible:ring-0! active:translate-y-0!"
            variant="ghost"
          >
            <UserAvatar
              className={AVATAR_FALLBACK_SIZE}
              image={image}
              name={name}
            />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {name}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                {email}
              </p>
            </div>
            <ChevronDownIcon className="shrink-0 text-sidebar-foreground/40" />
          </Button>
        }
      />
      <DropdownMenuContent>
        <div className="flex items-center gap-3">
          <UserAvatar
            className={AVATAR_FALLBACK_SIZE}
            image={image}
            name={name}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex justify-between focus:bg-transparent focus:text-inherit"
          closeOnClick={false}
        >
          <div className="gap-2 flex">
            <PaletteIcon />
            <span>Theme</span>
          </div>
          <ThemeSwitcher />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserDropdown };
