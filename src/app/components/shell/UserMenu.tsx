"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { BellRing, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/app/components/generalUIcomp/UserAvatar";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { signOutHandler } from "@/actions/auth-actions";
import { useViewer } from "@/context/viewerContext";

/** Profile menu (§4.2). `trigger` lets the sidebar footer and top bar render different triggers. */
export const UserMenu = ({
  trigger,
  side = "bottom",
  align = "end",
}: {
  trigger: React.ReactElement;
  side?: "bottom" | "top" | "right";
  align?: "start" | "end";
}) => {
  const router = useRouter();
  const { user: currentUser } = useViewer()

  const onSignOut = async () => {
    await signOutHandler();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent side={side} align={align} className="w-64 font-sans">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <UserAvatar person={currentUser} size="default" showStatus />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-heading">
              {currentUser.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => router.push("/u/settings?tab=profile")}
          >
            <UserRound /> My profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/u/settings?tab=security")}
          >
            <ShieldCheck /> Security
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/u/settings?tab=notifications")}
          >
            <BellRing /> Notification preferences
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <div className="px-1.5 pb-1.5">
            <ThemeSwitcher />
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onSignOut} className="cursor-pointer">
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
