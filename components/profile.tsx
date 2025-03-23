"use client";
import { useSession } from "next-auth/react";

import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsDownUp } from "lucide-react";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";

export default function Profile() {
  const publicImageUrl = "/fallback.png";
  const { data: session, status } = useSession();
  if (status === "loading") return;
  if (!session) return;
  return (
    <div className="flex items-center gap-3">
      <Image
        src={session.user.image || publicImageUrl}
        width={48}
        height={48}
        alt="fafd"
        className="rounded-full"
      />
      <div>
        <p className="text-[1rem]">{session.user.name!}</p>
        <p className="text-xs font-medium text-muted-foreground">
          {session.user.email!}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <ChevronsDownUp />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Button
              className="w-full h-full"
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Log out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
