"use client";
import {
  LayoutDashboard,
  Pen,
  User,
  School,
  Users,
  StopCircleIcon,
  FileStack,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getNavItems } from "@/lib/utils";

// Menu items.
// const items = [
//   {
//     title: "Dashboard",
//     url: "/",
//     icon: LayoutDashboard,
//   },
//   {
//     title: "Articles",
//     url: "/articles",
//     icon: School,
//   },
//   {
//     title: "Users",
//     url: "/users",
//     icon: Users,
//   },
//   {
//     title: "Oppositions",
//     url: "/oppositions",
//     icon: StopCircleIcon,
//   },
//   {
//     title: "Paiments",
//     url: "/payments",
//     icon: FileStack,
//   },
// ];

export function AppSidebar() {
  // const items = getNavItems(currentUser?.user.role);
  const { data: session } = useSession();
  const currentUser = session?.user;
  const items = getNavItems(currentUser?.role);
  console.log(items);
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="mt-12  ">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className="rounded-2xl h-14 w-full"
                    asChild
                  >
                    <Link href={item.url} className="flex items-center p-3  ">
                      <item.icon size={64} className="w-12 h-12" />
                      <span className="text-md font-semibold ">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
