"use client";

import { useSidebar } from "@/components/ui/sidebar";
import InnerNav from "./inner-nav";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open } = useSidebar(); // Now safe to use!

  return (
    <main
      className={`px-8 mt-12 transition-all duration-300 ${
        open ? "w-[calc(100vw-16rem)]" : "w-full"
      }`}
    >
      <InnerNav />

      {children}
    </main>
  );
}
